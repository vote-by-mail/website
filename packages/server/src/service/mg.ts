import mailgun from 'mailgun-js'

import { Letter } from './letter'
import { processEnvOrThrow } from '../common'
import { Logging } from '@google-cloud/logging'
import { MailgunLogLevel, GCPLogLevel, MailgunHookBody } from './webhooks'

export const mg = mailgun({
  domain: processEnvOrThrow('MG_DOMAIN'),
  apiKey: processEnvOrThrow('MG_API_KEY'),
})

interface Options {
  pdfBuffer?: Buffer
  force?: boolean
  recordsEmail?: string
  id?: string
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
  { pdfBuffer, force, id }: Options = { force: false }
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
    'v:metadata': { 
      uid: id
    },
  }

  const name = `${letter.info.nameParts.first} ${letter.info.nameParts.last}`
  const attachment = [
    signatureAttachment ?? [],
    idPhotoAttachment ?? [],
    pdfBuffer ? [new mg.Attachment({
      data: pdfBuffer,
      filename: `${name.replace(/[^0-9a-zA-Z]/g,'_')}-vote-by-mail.pdf`,
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
  { pdfBuffer, force, id }: Options = { force: false },
): Promise<mailgun.messages.SendResponse | null> => {
  if (process.env.MG_DISABLE) { // to disable MG for testing
    console.warn('No email sent (disabled)')
    return null
  }

  const emailData = toSignupEmailData(letter, voterEmail, officialEmails, { pdfBuffer, force, id })
  return mg.messages().send(emailData)
}

const mailgunToGCPLogLevel = (mailgunLogLevel: MailgunLogLevel): GCPLogLevel => {
  switch (mailgunLogLevel) {
    case 'info': return 'INFO'
    case 'warn':
    case 'temporary': return 'WARNING'
    case 'error': return 'ERROR'
  }
}

export const logMailgunLogToGCP = async (body: MailgunHookBody): Promise<void> => {
  const logging = new Logging({
    projectId: processEnvOrThrow('GCLOUD_PROJECT'),
    // If you're running this locally it might be needed to give the right IAM
    // permissions to a service account and pass down the credentials in the
    // lines below (uncomment and replace the example). When this project is
    // deployed Google Cloud Platform automatically handles permissions for apps
    // using these functions through GAE or GCE.

    // credentials: {
    //   'client_email': 'user@gmail.com',
    //   'private_key': 'private_key',
    // }
  })
  const log = logging.log('mailgun-log')
  const mgLogLevel = body['event-data']['log-level']
  const gcpLogLevel = mailgunToGCPLogLevel(mgLogLevel)
  const messageID = body['event-data'].id

  if (!gcpLogLevel) {
    throw new Error(`Could not get GCP log level for MG hook of messageID: ${messageID}`)
  }

  const metadata = {
    resource: {type: 'global'},
    // See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
    severity: gcpLogLevel,
  }

  // Streams Mailgun webhook bodies to GCP
  const entry = log.entry(metadata, body)

  await log.write(entry)
}
