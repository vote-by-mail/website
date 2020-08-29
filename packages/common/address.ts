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
  streetNumber: string
  city: string
  state: string
  postcode: string
  unit?: string
}


/** Formats only street and street number */
export const formatStreetInputParts = (addr: AddressInputParts): string => {
  return addr.streetNumber
    ? `${addr.streetNumber} ${addr.street}`
    : addr.street
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
  const street = formatStreetInputParts(addr)
  return addr.unit
    ? `${street} ${formatUnit(addr.unit)}, ${addr.city}, ${addr.state} ${addr.postcode}`
    : `${street}, ${addr.city}, ${addr.state} ${addr.postcode}`
}
