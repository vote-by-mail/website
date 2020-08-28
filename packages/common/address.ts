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

export const formatAddressInputParts = (addr: AddressInputParts): string => {
  const street = formatStreetInputParts(addr)
  return addr.unit
    ? `${street} #${addr.unit}, ${addr.city}, ${addr.state} ${addr.postcode}`
    : `${street}, ${addr.city}, ${addr.state} ${addr.postcode}`
}
