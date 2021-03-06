import { NameParts } from './nameParts'

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

export const allRegistrationStatus = [
  'Active',
  'Challenged',
  'Not Eligible',
  // Not from the Alloy API, but we use it here since the API returns
  // null on these cases
  'Not Found',
  'Denied',
  // Not from the Alloy API, used when requests fails to complete
  'Error',
  'Inactive',
  'Pending',
  'Confirmation',
  'Removed',
  'Preregistered',
  'Rejected',
  'Unregistered',
  'Verify',
  'Cancelled',
  'Incomplete',
  'Purged',
  'Not Reported',
  'Suspense',
  'Provisional',
] as const

// Most values were taken from Alloy API:
// https://docs.alloy.us/api/#/paths/~1v1~1voters/get
//
// Some additional values were taken from this section of the API:
// https://docs.alloy.us/api/#section/Sandbox/Getting-Started
export type RegistrationStatus = (typeof allRegistrationStatus)[number]

export interface RegistrationArgs {
  nameParts: NameParts
  birthdate?: string
  stateAbbr: string
  city: string
  postcode: string
  street: string
  unit?: string
}

export interface AlloyResponse {
  id: string
  status: RegistrationStatus
}
