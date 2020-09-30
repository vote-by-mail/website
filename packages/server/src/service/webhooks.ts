import Express from 'express'
import multer from 'multer'
import { logMailgunLogToGCP, mg } from './mg'

/* eslint-disable @typescript-eslint/no-explicit-any */
// https://documentation.mailgun.com/en/latest/api-events.html?highlight=log-level#event-structure
export type MailgunLogLevel = 'info'| 'warn' | 'temporary' | 'error'

// https://documentation.mailgun.com/en/latest/api-events.html?highlight=Event-Type#event-types
export type MailgunEventType =
  | 'accepted' | 'rejected' | 'delivered' | 'failed'
  | 'opened' | 'clicked' | 'unsubscribed' | 'complained'
  | 'stored' | 'list_member_uploaded' | 'list_member_upload_error'
  | 'list_uploaded'

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
export type GCPLogLevel = 'INFO' | 'WARNING' | 'ERROR'

// Currently (at Sep 2nd 2020), @types/mailgun-js does not yet provide
// rich information about the two interfaces here. These STUB definitions
// will help us work around this limitation.

export type MailgunEventReason = 'generic' | 'bounce' | 'suppress-bounce'

// Based on the example at
// https://documentation.mailgun.com/en/latest/user_manual.html#events
export interface MailgunEventData {
  severity: string
  tags: string[]
  /** Seconds since January 1st, 1970 */
  timestamp: number
  storage: { url: string, key: string }
  'log-level': MailgunLogLevel
  id: string
  campaigns: string[]
  reason: MailgunEventReason
  'user-variables': any
  flags: {
    'is-routed': boolean
    'is-authenticated': boolean
    'is-system-test': boolean
    'is-test-mode': boolean
  }
  envelope: {
    /** Example: me@mydomain.com */
    sender: string
    transport: 'smtp'
    /** Example: 'alice@gmail.com' | ['bob@gmail.com', 'alice@gmail.com'] */
    targets: string | string[]
  }

  /** Example: bob@gmail.com */
  recipient: string
  /** Example: 'gmail.com' if recipient is 'bob@gmail.com' */
  'recipient-domain': string

  message: {
    headers: Record<string, any>
    attachments: string[]
    size: number
  }

  event: MailgunEventType

  'delivery-status': {
    'attempt-no': number
    message: string
    code: number
    description: string
    'session-seconds': number
  }
}

// https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
export interface MailgunHookBody {
  /**
   * Used to prove the authenticy of MG webhook requests
   */
  signature: {
    /** Seconds since January 1st, 1970 */
    timestamp: number
    token: string
    signature: string
  }

  'event-data': MailgunEventData
}

export const registerLogWebhooksEndpoints = (app: Express.Application) => {
  app.post('/mailgun_logging_webhook', multer().none(), async (req, res) => {
    // Mailgun webhook posts are multipart requests, we need to manually stream
    // data from the request to this array then parse its buffered content as JSON
    //
    // https://www.mailgun.com/blog/a-guide-to-using-mailguns-webhooks/.
    const body = await (async () => {
      const rawBody: Uint8Array[] = []
      // Awaits for all req.body content
      req.addListener('data', (chunk) => rawBody.push(chunk))
      await new Promise(resolve => req.addListener('end', () => resolve(true)))

      const buffer = Buffer.concat(rawBody)
      return JSON.parse(buffer.toString('utf-8')) as MailgunHookBody
    })()

    // More details about MG webhook security at
    // https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
    const validWebhook = mg.validateWebhook(
      body.signature.timestamp,
      body.signature.token,
      body.signature.signature,
    )

    if (!validWebhook) {
      console.error('Invalid signature in request to Mailgun webook.')
      res.sendStatus(401)
      return res.end()
    }

    logMailgunLogToGCP(body)
    res.sendStatus(200)
    return res.end()
  })
}
