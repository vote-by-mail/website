// From here: https://ga-dev-tools.appspot.com/campaign-url-builder/
export interface UTM {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

export interface Voter extends UTM {
  uid: string
}

export type RegistrationStatus =
  | 'Active'
  | 'Challenged'
  | 'Not Eligible'
  | 'Denied'
  | 'Inactive'
  | 'Pending'
  | 'Confirmation'
  | 'Removed'
  | 'Preregistered'
  | 'Rejected'
  | 'Unregistered'
  | 'Verify'
  | 'Cancelled'
  | 'Incomplete'
  | 'Purged'
  | null
