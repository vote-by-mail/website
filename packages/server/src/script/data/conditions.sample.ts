import { makeResendEmailsConditions } from '../resendSignupEmails'

export const conditions = makeResendEmailsConditions(
  'New York emails needed to be resent.',
  ['state', '==', 'New York'],
  ['email', '==', 'email@votebymail.io'],
)
