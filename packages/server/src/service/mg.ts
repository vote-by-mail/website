import mailgun from 'mailgun-js'

import { Letter } from './letter'
import { processEnvOrThrow } from '../common'

export const mg = mailgun({
  domain: processEnvOrThrow('MG_DOMAIN'),
  apiKey: processEnvOrThrow('MG_API_KEY'),
})

interface Options {
  pdfBuffer?: Buffer
  force?: boolean
  recordsEmail?: string
}

const toAddresses = (
  emailOfficials: boolean,
  officialEmails: string[],
  voterEmail: string,
  { recordsEmail, force }: Options = { recordsEmail: undefined, force: false }
) => {

  if (emailOfficials || force) {
    if (recordsEmail) {
      return [voterEmail, ...officialEmails, recordsEmail]
    } else {
      return [voterEmail, ...officialEmails]
    }
  }
  return [voterEmail]
}

// separate out this function for testing purposes
export const toSignupEmailData = (
  letter: Letter,
  voterEmail: string,
  officialEmails: string[],
  { pdfBuffer, force }: Options = { force: false }
): mailgun.messages.SendData => {
  const emailOfficials = !!process.env.EMAIL_FAX_OFFICIALS
  const to = toAddresses(
    emailOfficials,
    officialEmails,
    voterEmail,
    { recordsEmail: process.env['RECORDS_ADDR'], force: force },
  )
  const { md, render, signatureAttachment, idPhotoAttachment, subject } = letter
  const mgData = {
    from: processEnvOrThrow('MG_FROM_ADDR'),
    'h:Reply-To': [processEnvOrThrow('MG_REPLY_TO_ADDR'), voterEmail, ...officialEmails].join(','),
  }

  const attachment = [
    signatureAttachment ?? [],
    idPhotoAttachment ?? [],
    pdfBuffer ? [new mg.Attachment({
      data: pdfBuffer,
      filename: `${letter.info.name.replace(
        /[^0-9a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ]/g,
        '_')}-vote-by-mail.pdf`,
    })] : []
  ].flatMap(x => x)
  return {
    to,
    subject,
    html: render('email'),
    text: md('email'),
    attachment,
    inline: attachment,
    ...mgData,
  }
}

export const sendSignupEmail = async (
  letter: Letter,
  voterEmail: string,
  officialEmails: string[],
  { pdfBuffer, force }: Options = { force: false },
): Promise<mailgun.messages.SendResponse | null> => {
  if (process.env.MG_DISABLE) { // to disable MG for testing
    console.warn('No email sent (disabled)')
    return null
  }

  const emailData = toSignupEmailData(letter, voterEmail, officialEmails, { pdfBuffer, force })
  return mg.messages().send(emailData)
}
