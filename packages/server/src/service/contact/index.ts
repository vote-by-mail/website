import { RawContact } from './type'
import { Locale, isAvailableState, ContactData, AvailableState, contactOverride } from '../../common'
import { keys } from './search'
import { contactRecords, michiganRecords, wisconsinRecords } from './loader'
import { getFipsCode } from '../fipsCode'
import { normalizeLocaleKey } from './normalize'

const enrichContact = (raw: RawContact, key: string, state: AvailableState): ContactData => {
  return {
    ...raw,
    key,
    state,
  }
}

export const getContact = async (state: AvailableState, key: string): Promise<ContactData | null> => {
  const stateRecords = (await contactRecords)[state]
  const raw = stateRecords[key]
  if (raw) return enrichContact(raw, key, state)
  return null
}

export const getFirstContact = async (state: AvailableState): Promise<ContactData> => {
  const stateRecords = (await contactRecords)[state]
  const [key, raw] = Object.entries(stateRecords)[0]
  return enrichContact(raw, key, state)
}

export const getArcGisContact = async (
  latLong: [number, number],
  county: string,
  state: 'Michigan' | 'Wisconsin',
  {cacheQuery} = {cacheQuery: false},
): Promise<ContactData | null> => {
  const fipscode = await getFipsCode(latLong, state, {cacheQuery})
  if (!fipscode) return null

  const records = state === 'Michigan'
    ? await michiganRecords
    : await wisconsinRecords
  const record = records[fipscode + ':' + county.toLowerCase()]
  if (!record) return null

  const key = normalizeLocaleKey({state, county: record.county, city: record.city})
  return enrichContact(record, key, state) ?? null
}

export const toContact = async (locale: Locale): Promise<ContactData | null> => {
  const { state, latLong, county } = locale
  if (!isAvailableState(state)) return null

  // Need to search for Michigan and Wisconsin Directly
  if ((state === 'Michigan' || state === 'Wisconsin') && latLong && county) {
    const contact = await getArcGisContact(latLong, county, state)
    if (contact) return contact
    console.warn(`Unable to directly geocode ${state} locale ${JSON.stringify(locale)}, fallback to users decision`)
    return null
  }

  for (const key of keys(locale as Locale<AvailableState>)) {
    const result = await getContact(state, key)
    if (result) {
      if (contactOverride[result.key]) {
        return {
          ...result,
          ...contactOverride[result.key],
        }
      }

      return result
    }
  }
  return null
}

export { contactRecords }
