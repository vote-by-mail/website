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

export const formatAddressInputParts = (addr: AddressInputParts): string => {
  return addr.unit
    ? `${addr.street} # ${addr.unit}, ${addr.city}, ${addr.state} ${addr.postcode}`
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

export const backwardCompatibleAddressParts = (address: Address): AddressInputParts => {
  if (address.addressParts) return address.addressParts
  const { city, postcode, state, street, streetNumber, unit } = address

  if (!street || !city) {
    throw new Error('Missing street and city fields from address')
  }

  return {
    city,
    postcode,
    state,
    street: streetNumber ? `${streetNumber} ${street}` : street,
    unit,
  }
}
