import * as admin from 'firebase-admin'
import { StateInfo, _Id, Voter, ContactMethod } from '../common'
import Mailgun from 'mailgun-js'
import { FaxStatus } from 'twilio/lib/rest/fax/v1/fax'

// main colleciton
export interface User extends _Id {
  displayName: string
  emails: Array<{
      value: string
      type?: string
  }>
  accessToken: string
  refreshToken: string
}

// subcollection
export interface Org extends _Id {
  name?: string
  privacyUrl?: string
  facebookId?: string
  googleId?: string
  registrationUrl?: string
  user: {
    owner: string     // Only single owner (creator)
    admins: string[]   // Owner always admin
    members: string[]  // Admins always members
    pendings: string[] // pending is mutually exclusive with other groups
  }
}

export interface TwilioResponse {
  url: string
  sid: string
  status: FaxStatus
}

export interface Resend {
  // Datetime in milllis.
  dateTime: number 
  reason: string
}

export type RichStateInfo = StateInfo & {
  created: admin.firestore.Timestamp
  voter: Voter
  mgResponse?: Mailgun.messages.SendResponse | null
  twilioResponses?: TwilioResponse[]
  method?: ContactMethod
  resends?: Resend[]
}
