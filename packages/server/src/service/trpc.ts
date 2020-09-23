import { data, error } from '@tianhuil/simple-trpc/dist/util'
import { ImplRpc } from '@tianhuil/simple-trpc/dist/type'
import { Request } from 'express'
import { IVbmRpc, StateInfo, toLocale, toContactMethod, isState, Voter, Locale, ImplementedState, RegistrationArgs, AddressInputParts } from '../common'
import { FirestoreService } from './firestore'
import { mg } from './mg'
import { toContact, contactRecords, getContact as _getContact } from './contact'
import { geocode, zipSearch } from './gm'
import { sib } from './sendinblue'
import { isRegistered } from './alloy'
import { sendAndStoreSignup } from './signup'

const firestoreService = new FirestoreService()

interface HostInfo {
  ip?: string
  userAgent?: string
}

const hostInfo = (request: Request): HostInfo => {
  // https://cloud.google.com/appengine/docs/flexible/nodejs/reference/request-headers
  return {
    ip: process.env.NODE_ENV !== 'development'
      ? request.headers['x-forwarded-for'] as string
      : request.connection.remoteAddress, // The above won't work on dev builds
    userAgent: request.headers['user-agent'],
  }
}

export class VbmRpc implements ImplRpc<IVbmRpc, Request> {
  public add = async (x: number, y: number) => data(x + y)
  public fetchInitialData = async (org: string) => {
    const orgObj = await firestoreService.fetchOrg(org)
    return data({
      emailFaxOfficials: !!process.env.EMAIL_FAX_OFFICIALS,
      facebookId: orgObj?.facebookId,
      googleId: orgObj?.googleId,
      org: {
        name: orgObj?.name,
        privacyUrl: orgObj?.privacyUrl,
        registrationUrl: orgObj?.registrationUrl,
      },
    })
  }
  public fetchState = async (zip: string) => {
    const address = await zipSearch(zip)
    if (!address || !isState(address.state)) return error('Geocoding Error')
    return data(address.state)
  }
  public fetchContactAddress = async (addr: AddressInputParts | string) => {
    const address = await geocode(addr)
    if (!address) return error('Unable to geocode address')
    const locale = toLocale(address)
    if (!locale) return error('Unable to obtain locale')
    const contact = await toContact(locale)
    if (!contact) return error('Unable to find contact')
    return data({contact, address})
  }
  public fetchContact = async (locale: Locale) => {
    const contact = await toContact(locale)
    if (!contact) return error('Unable to find contact')
    return data(contact)
  }
  public fetchContacts = async (state: ImplementedState) => {
    const stateRecords = (await contactRecords)[state]
    return data(Object.keys(stateRecords))
  }
  public getContact = async (state: ImplementedState, key: string) => {
    const result = await _getContact(state, key)
    if (!result) return error('Unable to find contact')
    return data(result)
  }
  public contactUs = async (
    authorEmail: string, authorName: string, text: string,
  ) => {
    try {
      await mg.messages().send({
        to: 'support@votebymail.io',
        from: 'support@votebymail.io',
        "h:Reply-To": authorEmail,
        subject: `Submission from Contact Us (${authorName} ${authorEmail})`,
        text: text,
      })
      return data(true)
    } catch(e) {
      console.error(e)
      return error(e)
    }
  }
  public subscribe = async (email: string) => {
    try {
      const success = await sib.addSubscriber(email)
      if (!success) throw(success)
      return success
    } catch(e) {
      console.error(e)
      return e
    }
  }
  public isRegistered = async (voter: RegistrationArgs) => {
    try {
      const response = await isRegistered(voter)
      return data(response)
    } catch(e) {
      console.error(e)
      return error(e)
    }
  }
  public register = async (info: StateInfo, voter: Voter, request: Request) => {
    const method = toContactMethod(info.contact)
    if (!method) return error('Unable to find contact details for local official')

    const id = await firestoreService.addRegistration({
      ...info,
      ...hostInfo(request),
      voter,
      method,
    })

    return data(id, async (): Promise<void> => {
      await sendAndStoreSignup(info, method, id)
    })
  }
}
