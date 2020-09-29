import { makeResendEmailsConditions, whereFromCSV } from '../resendSignupEmails'

export const conditions = makeResendEmailsConditions(
  'Emails of 14 states needed to be resent.',
  whereFromCSV('sample.csv', 'in', s => s),
  ['email', '==', 'email@votebymail.io'],
)
