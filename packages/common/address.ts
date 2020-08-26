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

export const formatAddressInputParts = (addr: AddressInputParts): string => {
  return addr.unit
    ? `${addr.street} #${addr.unit}, ${addr.city}, ${addr.state} ${addr.postcode}`
    : `${addr.street}, ${addr.city}, ${addr.state} ${addr.postcode}`
}

/**
 * Returns all found numbers in the given street address, return null if
 * none is found.
 *
 * This function can return more than one possible street number, in these
 * cases users must select their street number from this list manually.
 */
export const possibleStreetNumbers = (street: string): string[] | null => {
  // Checks for numbers between word boundaries, so cases like 5th avenue
  // are ignored.
  const match = street.match(/\b([0-9]+)\b/g)
  return match
}


/** Converts the given AddressInputParts to an Address interface */
export const addressPartsToAddress = (addr: AddressInputParts): Address => {
  const streetNumbers = possibleStreetNumbers(addr.street)

  return {
    addressParts: addr,
    country: 'US',
    fullAddr: formatAddressInputParts(addr),
    queryAddr: formatAddressInputParts(addr),
    postcode: addr.postcode,
    state: addr.state,
    city: addr.city,
    street: addr.street,
    stateAbbr: getStateAbbr(addr.state as State),
    // If more than one streetNumber, we should let users manually pick
    // them on the front-end.
    streetNumber: streetNumbers?.length === 1 ? streetNumbers[0] : undefined,
    unit: addr.unit,
  }
}
