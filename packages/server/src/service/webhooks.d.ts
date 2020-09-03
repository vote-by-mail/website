/* eslint-disable @typescript-eslint/no-explicit-any */
export type MailgunLogLevel = 'info' | 'warn' | 'temporary' | 'error'
export type GCPLogLevel = 'INFO' | 'WARNING' | 'ERROR'

// Currently (at Sep 2nd 2020), @types/mailgun-js does not yet provide
// rich information about the two interfaces here. These STUB definitions
// will help us work around this limitation.

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
  reason: string
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

  event:
    | 'accepted' | 'rejected' | 'delivered' | 'failed'
    | 'opened' | 'clicked' | 'unsubscribed' | 'complained'
    | 'stored' | 'list_member_uploaded' | 'list_member_upload_error'
    | 'list_uploaded'

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
