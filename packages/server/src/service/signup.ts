import * as admin from 'firebase-admin'
import { StateInfo, ContactMethod } from '../common'
import { Letter } from './letter'
import { toPdfBuffer } from './pdf'
import { sendSignupEmail } from './mg'
import { FirestoreService } from './firestore'
import { storageFileFromId, StorageFile } from './storage'
import { TwilioResponse, RichStateInfo } from './types'
import { sendFaxes } from './twilio'
const firestoreService = new FirestoreService()


export const sendAndStoreSignup = async (
  info: StateInfo,
  method: ContactMethod,
  id: string,
  resendReasonAndOriginalDate?: string,
) => {
  const letter = new Letter(info, method, id, resendReasonAndOriginalDate)
  const pdfBuffer = await toPdfBuffer(letter.render('html'), await letter.form)
  const isResend = resendReasonAndOriginalDate !== undefined
  if (isResend && info?.id !== id) {
    throw new Error('When resending emails, StateInfo should be RichStateInfo with id')
  }

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
    return
  }

  // Upload PDF
  let file: StorageFile
  if (isResend) {
    // When resending signups Needs to get how many times this file was resent
    const { id, resends } = info as RichStateInfo

    const numResends = resends ? resends.length : 0
    file = storageFileFromId(`${id}-${numResends}`)
    await file.upload(pdfBuffer)
  } else {
    file = storageFileFromId(id)
    // We have scripts that tests registering in batches, these scripts use
    // fake_voter@votebymail.io as a fake email address; to avoid storing
    // needless amount of files we only upload/save files when voters'
    // email are different from this
    if (info.email !== 'fake_voter@votebymail.io') {
      await file.upload(pdfBuffer)
    }
  }

  // Send faxes
  let twilioResponses: TwilioResponse[] = []
  if (method.faxes.length > 0) {
    const uri = await file.getSignedUrl(24 * 60 * 60 * 1000)
    const resposnes = await sendFaxes(uri, method.faxes)
    twilioResponses = resposnes.map(({url, sid, status}) => ({url, sid, status}))

    for (const twilioResponse of twilioResponses) {
      if (twilioResponse.status !== 'queued') {
        console.error(`Error sending faxes for ${info.id ?? id}.`)
        console.error(twilioResponse)
        return
      }
    }
  }

  // Update voter data in firestore.
  if (isResend) {
    const resend = { dateTime: new Date().getTime(), reason: resendReasonAndOriginalDate }
    await firestoreService
      .db
      .collection('StateInfo')
      .doc(id)
      .update({
        resends: admin.firestore.FieldValue.arrayUnion(resend)
      })
  }
  await firestoreService.updateRegistration(id, mgResponse, twilioResponses)
}
