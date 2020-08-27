import axios from 'axios'
import { processEnvOrThrow, Address, AddressInputParts, formatAddressInputParts } from '../common'
import { cache } from './util'

interface GMResults {
  results: google.maps.GeocoderResult[]
  status: google.maps.GeocoderStatus
}

const apiKey = processEnvOrThrow('GOOGLE_MAPS_API_KEY')

const findByType = (
  components: google.maps.GeocoderAddressComponent[],
  type: string,
  getShortName = false,
) => {
  return (getShortName
           ? components.find(c => c.types.includes(type))?.short_name
           : components.find(c => c.types.includes(type))?.long_name)
}

// Helping function for rawGeocode
const geocodeQuery = (addr: AddressInputParts | string) => {
  if (typeof addr === 'object') {
    // Using both address and component filtering field to ensure precise
    // results https://developers.google.com/maps/documentation/geocoding/overview#component-filtering
    const components = [
      'country:us',
      `locality:${addr.city}`,
      `administrative_area:${addr.state}`,
      `postal_code:${addr.postcode}`,
    ].join('|')
    const address = addr.unit
      ? `${addr.street} #${addr.unit}, ${addr.city}`
      : `${addr.street}, ${addr.city}`
    return encodeURIComponent(`${address}&components=${components}`)
  }
  return encodeURIComponent(addr)
}

/**
 * Returns a raw, uncached Google Maps API result.
 *
 * @param addr Ideally should be a AddressInputParts, however addr can be
 * a string in order to ensure backward-compatibility with <StateRedirect/>
 * since some orgs might already been sharing pre-defined links using this
 * component.
 */
const rawGeocode = async (addr: AddressInputParts | string): Promise<google.maps.GeocoderResult | null> => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${geocodeQuery(addr)}&key=${apiKey}`
  const response = (await axios.get(url)).data as GMResults
  if (response.status != 'OK') return null
  return response.results[0]
}

const rawZipSearch = async (zip: string): Promise<google.maps.GeocoderResult | null> => {
  // Because maps API uses ccTLD (https://developers.google.com/maps/documentation/geocoding/overview#RegionCodes)
  // since .io is assigned to the British Indian Ocean Territory we ensure
  // the usage of component filtering to avoid issues related to ccTLD.
  const query = `country:us|postcode:${zip}`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`
  const response = (await axios.get(url)).data as GMResults
  if (response.status != 'OK') return null
  return response.results[0]
}

const getLatLong = (location: google.maps.LatLng): [number, number] => {
  // Google's API has `.lat()` but you can also call `.lat` directly
  // and that is how the results are serialized (for cached results)
  return [location.lat as unknown as number, location.lng as unknown as number]
}

export const toAddress = (result: google.maps.GeocoderResult): Omit<Address, 'queryAddr'> | null => {
  const components = result.address_components

  const country = findByType(components, 'country')
  const state = findByType(components, 'administrative_area_level_1')
  const postcode = findByType(components, 'postal_code')
  if (!country || !state || !postcode) return null

  const city = (
    findByType(components, 'locality')
    ?? findByType(components, 'sublocality')
  )
  const otherCities = [
    findByType(components, 'administrative_area_level_3'),
    findByType(components, 'administrative_area_level_4'),
    findByType(components, 'administrative_area_level_5'),
  ].filter((c): c is string => !!c)

  return {
    latLong: getLatLong(result.geometry.location),
    fullAddr: result.formatted_address,
    city,
    country,
    state,
    stateAbbr: findByType(components, 'administrative_area_level_1', true),
    postcode,
    county: findByType(components, 'administrative_area_level_2'),
    otherCities: otherCities,
    streetNumber: findByType(components, 'street_number'),
    street: findByType(components, 'route'),
    unit: findByType(components, 'subpremise'),
  }
}

export const cacheGeocode = cache(
  rawGeocode,
  async x => typeof x === 'object' ? formatAddressInputParts(x) : x,
)
export const cacheZipSearch = cache(rawZipSearch, async x => x)

export const geocode = async (
  addr: AddressInputParts | string,
  {cacheQuery} = {cacheQuery: false},
): Promise<Address | null> => {
  const func = cacheQuery ? cacheGeocode : rawGeocode
  const result = await func(addr)
  if (!result) return null
  const address = toAddress(result)
  if (!address) return null
  return typeof addr === 'object'
    ? {
      ...address,
      addressParts: addr,
      queryAddr: formatAddressInputParts(addr),
    }
    : {
      ...address,
      queryAddr: addr,
    }
}

export const zipSearch = async (
  zip: string,
  {cacheQuery} = {cacheQuery: false},
): Promise<Address | null> => {
  const func = cacheQuery ? cacheZipSearch : rawZipSearch
  const result = await func(zip)
  if (!result) return null
  const address = toAddress(result)
  if (!address) return null
  return {
    ...address,
    queryAddr: zip,
  }
}
