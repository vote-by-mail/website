import * as admin from 'firebase-admin'

import { processEnvOrThrow, WithId, OrgDetails } from '../common'
import { Profile } from 'passport'
import { User, RichStateInfo, Org, TwilioResponse } from './types'
import { Analytics } from '../common/'
import Mailgun = require('mailgun-js')
import _ from 'underscore'

type DocumentReference = admin.firestore.DocumentReference<admin.firestore.DocumentData>
type Query = admin.firestore.Query<admin.firestore.DocumentData>
type DocumentSnapshot = admin.firestore.DocumentSnapshot
type Transaction = admin.firestore.Transaction

const nonNullObject = (o: unknown): o is Record<string, unknown> => typeof o === 'object' && o !== null

const removeUndefined = <T extends Record<string, unknown>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(
        ([_, val]) => val !== undefined
      ).map(
        ([key, val]) => [key, nonNullObject(val) ? removeUndefined(val) : val]
      )
  ) as T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DistributeOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

interface FetchOptions {
  limit: number
}

const defaultFetchOptions: FetchOptions = {
  limit: 5000,
}

export class FirestoreService {
  db: admin.firestore.Firestore

  // Firebase generates a warning if `admin.initializeApp` is called multiple times
  // However, if `projectId` is provided, (e.g. for testing), we do want to initialize app
  //
  // Warning Below:
  //
  // The default Firebase app already exists. This means you called initializeApp()
  // more than once without providing an app name as the second argument. In most
  // cases you only need to call initializeApp() once.But if you do want to initialize
  // multiple apps, pass a second argument to initializeApp() to give each app a
  // unique name.

  // https://stackoverflow.com/questions/57763991/initializeapp-when-adding-firebase-to-app-and-to-server
  constructor(projectId?: string) {
    if (projectId === undefined) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: processEnvOrThrow('FIRESTORE_URL'),
        })
      }

      this.db = admin.firestore()
    } else {
      this.db = admin.initializeApp({
        projectId,
        credential: admin.credential.applicationDefault(),
        databaseURL: processEnvOrThrow('FIRESTORE_URL'),
      }).firestore()
    }
  }

  //////////////////////////////////////////
  // Generic Helpers

  private withId<T extends {}>(snap: DocumentSnapshot): WithId<T> | null {
    const doc = snap.data() as T | undefined
    return doc ? {...doc, id: snap.id} : null
  }

  async get<T extends {}>(ref: DocumentReference, trans?: Transaction): Promise<WithId<T> | null> {
    const snap = await (trans ? trans.get(ref) : ref.get())
    return this.withId(snap)
  }

  private async getAll<T extends {}>(refs: DocumentReference[], trans?: Transaction): Promise<Array<WithId<T> | null>> {
    if (refs.length === 0) return []
    const snaps = await (trans ? trans.getAll(...refs) : this.db.getAll(...refs))
    return snaps.map(snap => this.withId<T>(snap))
  }

  async query<T extends {}>(ref: Query, trans?: Transaction): Promise<WithId<T>[]> {
    const snap = await (trans ? trans.get(ref) : ref.get())
    return snap.docs.map(doc => {
      return {
        ...doc.data() as unknown as T,
        id: doc.id
      }
    })
  }

  ////////////////////////////////////////////
  // Registration

  async addRegistration(info: DistributeOmit<RichStateInfo, 'created'>): Promise<string> {
    const richInfo: RichStateInfo = {
      ...removeUndefined(info),
      created: admin.firestore.Timestamp.fromDate(new Date())
    }
    const { id } = await this.db.collection('StateInfo').add(richInfo)
    return id
  }

  async updateRegistration(
    id: string,
    mgResponse: Mailgun.messages.SendResponse | null,
    twilioResponses: TwilioResponse[],
  ): Promise<void> {
    const update: Partial<RichStateInfo> = {
      mgResponse,
      twilioResponses,
    }
    await this.db.collection('StateInfo').doc(id).update(update)
  }

  async batchUpdateRegistrations(
    data: Array<Partial<RichStateInfo> & { id: string }>
  ): Promise<void> {
    // batch can only take up to 500 operations, slicing data array accordingly
    // https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
    for (const chunk of _.chunk(data, 500)) {
      const batch = this.db.batch()

      for (const update of chunk) {
        const ref = this.db.collection('StateInfo').doc(update.id)
        batch.update(ref, update)
      }

      await batch.commit()
    }
  }

  async getRegistration(id: string): Promise<RichStateInfo | null> {
    return this.get(this.db.collection('StateInfo').doc('' + id))
  }

  ////////////////////////////////////////////
  // User / Org Helpers

  uid(provider: string, id: string) {
    return `${provider}:${id}`
  }

  userRef(uid: string): DocumentReference
  userRef(provider: string, id: string): DocumentReference
  userRef(...arg: [string] | [string, string]): DocumentReference {
    switch (arg.length) {
      case 1: {
        const [uid] = arg
        return this.db.collection('User').doc(uid)
      }
      case 2: {
        const [provider, id] = arg
        return this.db.collection('User').doc(this.uid(provider, id))
      }
    }
  }

  orgRef(oid: string): DocumentReference {
    return this.db.collection('Org').doc(oid)
  }

  async fetchUser(uid: string, trans?: Transaction): Promise<User | null> {
    return this.get<User>(this.userRef(uid), trans)
  }

  async fetchOrg(oid: string, trans?: Transaction): Promise<Org | null> {
    return this.get<Org>(this.orgRef(oid), trans)
  }

  async updateAnalytics(oid: string, analytics: Analytics) {
    return this.orgRef(oid).update(analytics)
  }

  async fetchUserOrgs(uid: string, trans?: Transaction): Promise<Org[]> {
    const [orgs1, orgs2] = await Promise.all([
      this.query<Org>(this.db.collection('Org').where('user.members', 'array-contains', uid), trans),
      this.query<Org>(this.db.collection('Org').where('user.pendings', 'array-contains', uid), trans),
    ])
    return [...orgs1, ...orgs2]
  }

  async fetchOrgUsers(oid: string, trans?: Transaction): Promise<WithId<User>[]> {
    const org = await this.fetchOrg(oid)
    if (!org) return []
    const userRefs = [
      ...org.user.members.map(uid => this.userRef(uid)),
      ...org.user.pendings.map(uid => this.userRef(uid))
    ]
    const users = await this.getAll<User>(userRefs, trans)
    return users.filter((u): u is WithId<User> => !!u)
  }

  ////////////////////////////////////////////
  // User / Org Functions

  // new user
  async newUser(
    {
      provider,
      id,
      displayName,
      emails
    }: Profile,
    accessToken: string,
    refreshToken: string,
  ): Promise<string> {
    const user: User = {
      displayName,
      emails: emails || [],
      accessToken,
      refreshToken,
    }
    const uid = this.uid(provider, id)
    await this.userRef(uid).set(user, { merge: true })
    return uid
  }

  // claim (globally unique) org as role
  async claimNewOrg(uid: string, oid: string): Promise<boolean> {
    const newOrg: Org = {
      user: {
        owner: uid,
        admins: [uid],
        members: [uid],
        pendings: []
      }
    }
    try {
      await this.orgRef(oid).create(newOrg)
    } catch(err) {
      if (err.message.includes('6 ALREADY_EXISTS:')) {
        return false
      }
      throw err
    }
    return true
  }

  // user grants another user membership in an org where they are an admin
  async grantExistingOrg(adminUid: string, newUid: string, oid: string): Promise<boolean> {
    if (adminUid == newUid) return false
    return this.db.runTransaction(async trans => {
      const org = await this.fetchOrg(oid, trans)
      if (!org) return false
      if (!org.user.admins.includes(adminUid)) return false
      org.user.pendings = [...org.user.pendings, newUid]
      trans.update(this.orgRef(oid), org)
      return true
    })
  }

  // accept grant of membership for an organization
  async acceptOrg(uid: string, oid: string): Promise<boolean> {
    return this.db.runTransaction(async trans => {
      const org = await this.fetchOrg(oid, trans)
      if (!org) return false
      if (!org.user.pendings.includes(uid)) return false
      org.user.members = [...org.user.members, uid]
      org.user.pendings = org.user.pendings.filter(user => user != uid)
      return true
    })
  }

  // user pulls all registration from org
  async fetchRegistrations(uid: string, oid: string, options: FetchOptions = defaultFetchOptions): Promise<RichStateInfo[] | null> {
    const org = await this.fetchOrg(oid)
    if (!org) return null
    if (!org.user.members.includes(uid)) return null
    return this.query<RichStateInfo>(
      this.db.collection('StateInfo')
        .where('oid', '==', oid)
        .orderBy('created', 'desc')
        .limit(options.limit)
    )
  }

  // allows privileged users to change org details
  async updateOrgDetails(uid: string, oid: string, details: OrgDetails): Promise<boolean> {
    const org = await this.fetchOrg(oid)
    if (!org) return false
    if (!org.user.admins.includes(uid)) return false
    await this.orgRef(oid).update({
      name: details.name,
      privacyUrl: details.privacyUrl,
    })
    return true
  }

  async updateOrgRegistrationUrl(uid: string, oid: string, registrationUrl: string): Promise<boolean> {
    const org = await this.fetchOrg(oid)
    if (!org) return false
    if (!org.user.admins.includes(uid)) return false

    if (registrationUrl) { // allow empty URLs
      try {
        // Invalid urls are going to be thrown
        new URL(registrationUrl)
      } catch {
        return false
      }
    }

    await this.orgRef(oid).update({ registrationUrl })
    return true
  }

  /** Returns all the emails this user has associated to their account */
  async getOrgUser(uid: string): Promise<{ name: string, emails: string[] }> {
    // We don't store users ID on our collection, the only way of getting
    // a specific user is by filtering by the resource path.
    const users = await this.db.collection('User').get()
    const queriedUser = users.docs
      .filter(doc => doc.ref.path.includes(uid)) // returns only user == uid
      .map(doc => {
        const data = doc.data() as { emails: Array<{value: string}>, displayName: string }
        const emails = data.emails.map(email => email.value)
        return {
          name: data.displayName ?? 'Organizer',
          emails,
        }
      })[0]

    return queriedUser
  }

  ////////////////////////////////////////////
  // Cloud Analytics

  /**
   * Fetches the minimal fields (created) of all signups since lastQueryTime.
   *
   * @param lastQueryTime Will only query entries after this timestamp, unless
   * `queriedStateBefore` is `false`--then we'll query all the signups again
   *
   * @param stateLastQueryTime The last time we queried for per-state metric data
   * @param orgLastQueryTime The last time we queried for per-org metric data
   */
  async getSignups(
    lastQueryTime: number,
    stateLastQueryTime: number,
    orgLastQueryTime: number,
  ): Promise<Partial<RichStateInfo>[]> {
    const stateInfos = this.db.collection('StateInfo')
    const queryEntriesFrom = Math.min(lastQueryTime, stateLastQueryTime, orgLastQueryTime)

    // We only select 'created' when doing these queries, to avoid fetching
    // needless information.
    const query = stateInfos
      .where(
        // Using only the numeric value of lastQueryTime doesn't work
        'created', '>', admin.firestore.Timestamp.fromMillis(queryEntriesFrom),
      )
      .select('created', 'state', 'oid')
    return this.query<Partial<RichStateInfo>[]>(query)
  }

  async getAllOids(): Promise<string[]> {
    const orgs = this.db.collection('Org')
    const resp = await orgs.select('id').get()
    return resp.docs.map(e => e.id)
  }
}
