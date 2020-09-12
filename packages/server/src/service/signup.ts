import { StateInfo, ContactMethod } from '../common'
import { Letter } from './letter'
import { toPdfBuffer } from './pdf'
import { sendSignupEmail } from './mg'
import { FirestoreService } from './firestore'
import { storageFileFromId } from './storage'
import { TwilioResponse } from './types'
import { sendFaxes } from './twilio'
const firestoreService = new FirestoreService()

/**
 * Sends and store signups, returning true if the entire process was completed
 * without errors, and false otherwise.
 */
export const sendAndStoreSignup = async (
  info: StateInfo,
  method: ContactMethod,
  id: string,
): Promise<boolean> => {
  const letter = new Letter(info, method, id)
  const pdfBuffer = await toPdfBuffer(letter.render('html'), await letter.form)

  // Send email (perhaps only to voter)
  const mgResponse = await sendSignupEmail(
    letter,
    info.email,
    method.emails,
    { pdfBuffer, id },
  )
  if (!mgResponse || mgResponse.message !== 'Queued. Thank you.') {
    console.error('Error sending email for ' + info.id + '.')
    console.error(mgResponse)
    return false
  }

  // Upload PDF
  const file = storageFileFromId(id)
  await file.upload(pdfBuffer)

  // Send faxes
  let twilioResponses: TwilioResponse[] = []
  if (method.faxes.length > 0) {
    const uri = await file.getSignedUrl(24 * 60 * 60 * 1000)
    const resposnes = await sendFaxes(uri, method.faxes)
    twilioResponses = resposnes.map(({url, sid, status}) => ({url, sid, status}))

    for (const twilioResponse of twilioResponses) {
      if (twilioResponse.status !== "queued") {
        console.error(`Error sending faxes for ${info.id ?? id}.`)
        console.error(twilioResponse)
        return false
      }
    }
  }

  await firestoreService.updateRegistration(id, mgResponse, twilioResponses)
  return true
}
