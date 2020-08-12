export interface OrgDetails {
  name?: string
  privacyUrl?: string
}

export interface FeatureFlags {
  emailFaxOfficials: boolean
}

export interface Analytics {
  facebookId?: string
  googleId?: string
}

export type InitialData = FeatureFlags & Analytics & { org: OrgDetails }
