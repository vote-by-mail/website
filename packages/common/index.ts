export const processEnvOrThrow = (key: string): string => {
  const val = process.env[key]
  if (!val) throw new Error(`Need to set environment variable ${key}`)
  return val
}

export * from './util'
export * from './address'
export * from './trpc'
export * from './states'
export * from './vbmStatus'
export * from './contact'
export * from './locale'
export * from './initialData'
export * from './util'
export * from './voter'
export * from './sampleAddresses'
export * from './stateInfo'
export * from './statePortal'
export * from './vbmSignupDeadline'
export * from './nameParts'
