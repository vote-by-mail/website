import passport from 'passport'
import Express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import flash from 'connect-flash'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'

import { processEnvOrThrow, implementedStates, toStateMethod } from '../../common'
import { FirestoreService } from '../firestore'
import { FirestoreStore } from '@google-cloud/connect-firestore'
import { toCSVSting } from '../csv'
import { Org, RichStateInfo } from '../types'
import { storageFileFromId } from '../storage'
import { router as letterRouter } from '../letter/router'
import { recheckRegistration } from '../alloy'

const scope = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

const firestoreService = new FirestoreService()

passport.use(
  new GoogleStrategy({
    clientID: processEnvOrThrow('GOOGLE_CLIENT_ID'),
    clientSecret: processEnvOrThrow('GOOGLE_CLIENT_SECRET'),
    callbackURL: processEnvOrThrow('GOOGLE_CLIENT_CALLBACK'),
  },
  function(accessToken, refreshToken, profile, done) {
    firestoreService.newUser(profile, accessToken || '', refreshToken || '').then(
      (uid) => done(null, uid)
    )
  })
)

passport.serializeUser((uid, done) => {
  done(null, uid)
})

passport.deserializeUser((uid, done) => {
  done(null, uid)
})

const authenticate = passport.authenticate(
  'google'
)

const validSession: Express.RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.sendStatus(403)
  } else {
    next()
  }
}

const getUid = (req: Express.Request): string => {
  const uid = req.user as string | undefined
  if (!uid) throw Error('Need a valid user object')
  return uid
}

interface RequestWithOrg extends Express.Request {
  org: Org
}

const orgPermissions = (level: 'members' | 'admins'): Express.RequestHandler => {
  /* requires either member or admin permissions */
  return async (req, res, next) => {
    const { oid } = req.params
    const uid = getUid(req)
    const org = await firestoreService.fetchOrg(oid)
    if (!org) return res.sendStatus(404)
    if (!org.user[level].includes(uid)) return res.sendStatus(403);
    (req as RequestWithOrg).org = org
    return next()
  }
}

const maxOrgs = parseInt(processEnvOrThrow('USER_MAX_ORGS'))
const frontEnd = processEnvOrThrow('REACT_APP_URL')

const editUrl = (oid: string) => `/dashboard/${oid}`
const downloadUrl = (oid: string) => `/download/${oid}`
const updateAnalyticsUrl = (oid: string) => `/dashboard/${oid}/updateAnalytics`
const updateOrgDetailsUrl = (oid: string) => `/dashboard/${oid}/updateOrgDetails`
const updateOrgRegistrationUrl = (oid: string) => `/dashboard/${oid}/updateOrgRegistrationUrl`

const enrichOrg = (org: Org, uid: string) => ({
  ...org,
  isAdmin: org.user.admins.includes(uid),
  isPending: org.user.pendings.includes(uid),
  displayUrl: frontEnd + '#/org/' + org.id,
  editUrl: editUrl(org.id ?? ''),
  downloadUrl: downloadUrl(org.id ?? ''),
  updateAnalyticsUrl: updateAnalyticsUrl(org.id ?? ''),
  updateOrgDetailsUrl: updateOrgDetailsUrl(org.id ?? ''),
  updateOrgRegistrationUrl: updateOrgRegistrationUrl(org.id ?? '')
})

export const registerPassportEndpoints = (app: Express.Application) => {
  app.use(Express.static("public"))

  app.use(session({
    store: new FirestoreStore({
      dataset: firestoreService.db,
      kind: 'express-sessions',
    }),
    secret: processEnvOrThrow('SESSION_SECRET'),
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  }))

  app.use(flash())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.get('/auth/google',
    passport.authenticate(
      'google', {
        scope,
        prompt: 'consent'
      }
    )
  )

  app.get('/auth/google/callback', authenticate,
    (_, res) => res.redirect('/dashboard')
  )

  app.get('/auth/google/logout',
    (req, res) => {
      if (req.session) req.session.destroy(err => console.error(err))
      res.redirect('/')
    }
  )

  app.get('/dashboard', validSession,
    async (req, res) => {
      const uid = getUid(req)
      const [user, orgs] = await Promise.all([
        await firestoreService.fetchUser(uid),
        await firestoreService.fetchUserOrgs(uid)
      ])

      const richOrgs = orgs.map(org => enrichOrg(org, uid))

      res.render('dashboard', {
        maxOrgs,
        orgsFull: richOrgs.length >= maxOrgs,
        user,
        richOrgs,
        frontEnd,
        flash: req.flash(),
        implementedStates: new Array(...implementedStates).sort(),
        toStateMethod,
      })
    }
  )

  app.get('/embed/:oid', validSession, orgPermissions('members'), async (req, res) => {
    const uid = getUid(req)
    const env = {
      REACT_APP_URL: process.env.REACT_APP_URL,
    }
    const richOrg = enrichOrg((req as RequestWithOrg).org, uid)
    const states = [...implementedStates].sort()
    res.render('embed', { env, richOrg, states: ['No default state', ...states] })
  })

  app.get('/dashboard/:oid', validSession, orgPermissions('members'),
    async (req, res) => {
      const uid = getUid(req)
      const { oid } = req.params
      const stateInfos = await firestoreService.fetchRegistrations(uid, oid, { limit: 5 }) || []
      const enrichedtateInfos = await Promise.all(stateInfos.map(async s => ({
        ...s,
        signedUrl: await storageFileFromId(s.id || '').getSignedUrl(60 * 60 * 1000)
      })))
      return res.render('org', {
        richOrg: enrichOrg((req as RequestWithOrg).org, uid),
        flash: req.flash(),
        stateInfos: enrichedtateInfos,
      })
    }
  )

  app.post('/dashboard/:oid/updateAnalytics', validSession, orgPermissions('admins'),
    async (req, res) => {
      const { oid } = req.params
      const { facebookId, googleId } = req.body
      await firestoreService.updateAnalytics(oid, { facebookId, googleId })
      req.flash('success', `Added Facebook Pixel Id for org "${oid}" to "${facebookId}"`)
      req.flash('success', `Added Google Pixel Id for org "${oid}" to "${googleId}"`)
      return res.redirect(editUrl(oid))
    }
  )

  app.post('/dashboard/:oid/updateOrgDetails', validSession, orgPermissions('admins'),
    async (req, res) => {
      const { oid } = req.params
      const uid = getUid(req)
      const { privacyUrl, name } = req.body
      if (await firestoreService.updateOrgDetails(uid, oid, { name, privacyUrl })) {
        req.flash('success', `Updated org details for "${oid}".`)
      } else {
        req.flash('danger', `Failed to update org details for "${oid}", please check your privileges or try again in a few minutes.`)
      }
      return res.redirect(editUrl(oid))
    }
  )

  app.post('/dashboard/:oid/updateOrgRegistrationUrl', validSession, orgPermissions('admins'),
    async (req, res) => {
      const { oid } = req.params
      const uid = getUid(req)
      const { registrationUrl } = req.body
      if (await firestoreService.updateOrgRegistrationUrl(uid, oid, registrationUrl)) {
        req.flash('success', `${registrationUrl ? 'Updated' : 'Removed'} voter registration URL for "${oid}".`)
      } else {
        req.flash('danger', `Failed to update voter registration URL for "${oid}", please check your privileges or try again in a few minutes.`)
      }
      return res.redirect(editUrl(oid))
    }
  )

  app.post('/claimNewOrg', validSession,
    async (req, res) => {
      const { oid } = req.body
      const uid = getUid(req)
      const success = await firestoreService.claimNewOrg(uid, oid)
      if (success) {
        req.flash('success', `Added new org "${oid}"`)
      } else {
        req.flash('danger', `Cannot add already claimed org "${oid}"`)
      }
      res.redirect('/dashboard')
    }
  )

  app.get('/download/:oid', validSession, orgPermissions('members'),
    async (req, res) => {
      const { oid } = req.params
      const uid = getUid(req)
      const stateInfos = await firestoreService.fetchRegistrations(uid, oid) || []

      // This array will be used to batch update registrations
      const updatedRegistrations: Array<Partial<RichStateInfo> & { id: string }> = []

      for (let i = 0; i < stateInfos.length; i++) {
        // Note that recheckRegistration can return null if there's no need
        // for updates.
        const updatedAlloyData = await recheckRegistration(stateInfos[i])
        if (updatedAlloyData) {
          stateInfos[i].alloyStatus = updatedAlloyData
          updatedRegistrations[i] = {
            // Safe to type-cast this since recheckRegistration would've
            // thrown if otherwise
            id: stateInfos[i].id as string,
            alloyStatus: updatedAlloyData,
          }
        }
      }

      const csvString = toCSVSting(stateInfos)
      res.contentType('text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=${oid}-data.csv`)
      res.send(csvString)

      // Updates the batch in firestore after sending organizers the response.
      // This is done so they can download the file faster -- and if any error
      // happens while updating (but not while processing the request) we
      // don't bother them.
      if (updatedRegistrations.length) {
        await firestoreService.batchUpdateRegistrations(
          updatedRegistrations.filter(r => !!r) // Removes empty entries
        )
      }
    }
  )

  app.get('/status', validSession,
    (_, res) => {
      const env = {
        NODE_ENV: process.env.NODE_ENV,
        REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
        EMAIL_FAX_OFFICIALS: !!process.env.EMAIL_FAX_OFFICIALS,
        FIRESTORE_URL: process.env.FIRESTORE_URL,
      }
      res.render('status', { env })
    }
  )

  app.use('/letter', validSession, letterRouter)
}
