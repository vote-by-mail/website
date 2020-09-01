import { getStateAbbr, State } from './states'

export interface Address {
  latLong?: [number, number]
  addressParts?: AddressInputParts
  queryAddr: string
  fullAddr: string
  city?: string
  otherCities?: string[]
  county?: string
  postcode: string
  state: string
  stateAbbr?: string
  country: string

  // Street address components
  streetNumber?: string  // e.g. 1600
  street?: string        // e.g. Amphitheatre Pkwy
  unit?: string          // e.g. Apt 3C
}

export interface AddressInputParts {
  street: string // including street number, e.g. 100 S Biscayne Blvd
  city: string
  state: string
  postcode: string
  unit?: string
}

/** Removes unnecessary and trailing spacing */
const trim = (s: string) => s.replace(/( +)/g, ' ').trim()

/** Returns a formatted unit, using pound (#) only when necessary */
export const formatUnit = (unit: string) => {
  // Users might use pounds erroneously, let this function decide whether
  // to use it or not.
  //
  // We also remove unnecessary spacing, for example the double spacing
  // in 'BLDG  3'
  const normalized = trim(unit.replace(/#/g, ''))

  // Searchs for any abbreviation that don't require pounds
  //
  // The list of officially approved abbreviations can be found here: https://pe.usps.com/text/pub28/28apc_003.htm#ep538629
  // But we'll remove pounds if any word is found in the Unit field, since users
  // might not use the officially approved abbreviations or just commit a typo
  // while filling this field, e.g. APY 303.
  const dontUsePound = /( +|^)([a-z]+)( +|$)/i
  return !normalized.toUpperCase().match(dontUsePound)
    ? trim(`# ${normalized}`)
    : normalized
}

export const formatAddressInputParts = (addr: AddressInputParts): string => {
  return addr.unit
    ? `${addr.street} ${formatUnit(addr.unit)}, ${addr.city}, ${addr.state} ${addr.postcode}`
    : `${addr.street}, ${addr.city}, ${addr.state} ${addr.postcode}`
}

/** Converts the given AddressInputParts to an Address interface */
export const addressPartsToAddress = (addr: AddressInputParts): Address => ({
  addressParts: addr,
  country: 'US',
  fullAddr: formatAddressInputParts(addr),
  queryAddr: formatAddressInputParts(addr),
  postcode: addr.postcode,
  state: addr.state,
  city: addr.city,
  street: addr.street,
  stateAbbr: getStateAbbr(addr.state as State),
  unit: addr.unit,
})
