import { data, error } from '@tianhuil/simple-trpc/dist/util'
import { ImplRpc } from '@tianhuil/simple-trpc/dist/type'
import { Request } from 'express'
import { IVbmRpc, StateInfo, toLocale, toContactMethod, isState, Voter, Locale, ImplementedState } from '../common'
import { FirestoreService } from './firestore'
import { sendSignupEmail, mg } from './mg'
import { toContact, getContactRecords, getContact as _getContact } from './contact'
import { geocode } from './gm'
import { toPdfBuffer } from './pdf'
import { storageFileFromId } from './storage'
import { Letter } from './letter'
import { sendFaxes } from './twilio'
import { TwilioResponse } from './types'
import { sib } from './sendinblue'

const firestoreService = new FirestoreService()

interface HostInfo {
  ip?: string
  userAgent?: string
}

const hostInfo = (request: Request): HostInfo => {
  // https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
  return {
    ip: request.connection.remoteAddress,
    userAgent: request.headers['user-agent'],
  }
}

export class VbmRpc implements ImplRpc<IVbmRpc, Request> {
  public add = async (x: number, y: number) => data(x + y)
  public fetchAnalytics = async (org: string) => {
    const orgObj = await firestoreService.fetchOrg(org)
    return data({
      facebookId: orgObj?.facebookId,
      googleId: orgObj?.googleId,
    })
  }
  public fetchFeatureFlags = async () => {
    return data({
      emailFaxOfficials: !!process.env.EMAIL_FAX_OFFICIALS
    })
  }
  public fetchState = async (zip: string) => {
    const address = await geocode(`${zip} United States`)
    if (!address || !isState(address.state)) return error('Geocoding Error')
    return data(address.state)
  }
  public fetchContactAddress = async (addr: string) => {
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
    const stateRecords = (await getContactRecords())[state]
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
      const letter = new Letter(info, method, id)
      const pdfBuffer = await toPdfBuffer(letter.render('html'), await letter.form)

      // Send email (perhaps only to voter)
      const mgResponse = await sendSignupEmail(
        letter,
        info.email,
        method.emails,
        { pdfBuffer },
      )

      // Upload PDF
      const file = storageFileFromId(id)
      await file.upload(pdfBuffer)

      // Send faxes
      let twilioResponses: TwilioResponse[] = []
      if (method.faxes.length > 0) {
        const uri = await file.getSignedUrl(24 * 60 * 60 * 1000)
        const resposnes = await sendFaxes(uri, method.faxes)
        twilioResponses = resposnes.map(({url, sid, status}) => ({url, sid, status}))
      }

      await firestoreService.updateRegistration(id, mgResponse, twilioResponses)
    })
  }
}
