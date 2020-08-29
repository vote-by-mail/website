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
  street: string
  city: string
  state: string
  postcode: string
  unit?: string
}

/** Returns a formatted unit, using pound (#) only when necessary */
export const formatUnit = (unit: string) => {
  // Users might use pounds erroneously, let this function decide whether
  // to use it or not.
  const normalized = unit.replace(/#/g, '')

  // Searchs for any abbreviation that don't require pounds
  //
  // https://pe.usps.com/text/pub28/28apc_003.htm#ep538629
  const dontUsePound = /\b(APT|BLDG|DEPT|FL|FRNT|HNGR|KEY|LBBY|LOT|LOWR|OFC|PH|PIER|REAR|RM|SIDE|SLIP|SPC|STOP|STE|TRLR|UNIT|UPPR)\b/g
  return !normalized.toUpperCase().match(dontUsePound)
    ? `# ${normalized}`
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

export const splitStreetAndNumber = (street: string): {
  street: string
  number: string | null
} => {
  // Finds only numbers between spacing or at the end/beginning of sentences,
  // safely ignoring cases like `1/2` in `1/2 mile from`
  const pattern = /(( +)|^)([0-9]+)(( +)|$)/
  const match = street.match(pattern)
  const number = match ? match[0].trim() : null

  return {
    street: match ? street.replace(pattern, '') : street,
    number,
  }
}
