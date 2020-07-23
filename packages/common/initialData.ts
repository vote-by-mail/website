export interface FeatureFlags {
  emailFaxOfficials: boolean
}

export interface Analytics {
  facebookId?: string
  googleId?: string
}

export type InitialData = FeatureFlags & Analytics
