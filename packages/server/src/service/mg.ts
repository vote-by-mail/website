import mailgun from 'mailgun-js'
import { processEnvOrThrow } from '../common'

const mgData = () => ({
  domain: processEnvOrThrow('MG_DOMAIN'),
  apiKey: processEnvOrThrow('MG_API_KEY'),
  from: processEnvOrThrow('MG_FROM_ADDR'),
  replyTo: processEnvOrThrow('MG_REPLY_TO_ADDR'),
})

export interface EmailData {
  voterEmail: string
  officialEmails: string[]
  subject: string
  md: string
  html: string
  signature?: string  // base64-encoded signature
  force?: boolean
}

const makePngAttachment = (
  signature: string | undefined,
  to: string[],
  mg: mailgun.Mailgun
): mailgun.Attachment | undefined => {
  if (!signature) return undefined
  const data = signature.split(',')[1]
  if (!data) {
    console.error(`Bad formatting of signature image to ${to}.  Omitting attachment.`)
    return undefined
  }
  return new mg.Attachment({
    data: Buffer.from(data, 'base64'),
    filename: 'signature.png'
  })
}

export const sendEmail = async (
  {voterEmail, officialEmails, subject, md, html, signature, force}: EmailData
): Promise<mailgun.messages.SendResponse | null> => {
  if (process.env.MG_DISABLE) { // to disable MG for testing
    console.log('No email sent (disabled)')
    return null
  }
  const emailOfficials = !!process.env.REACT_APP_EMAIL_FAX_OFFICIALS
  const to = (emailOfficials || force) ? [voterEmail, ...officialEmails] : [voterEmail]
  
  const {domain, apiKey, from, replyTo} = mgData()
  const mg = mailgun({domain, apiKey})
  const attachment = makePngAttachment(signature, to, mg)

  return mg.messages().send({
    from,
    to,
    subject,
    html,
    text: md,
    attachment,
    'h:Reply-To': replyTo,
  })
}
