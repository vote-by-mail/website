import { RawContact } from './type'
import { Locale, isAvailableState, ContactData, AvailableState, contactOverride } from '../../common'
import { keys } from './search'
import { contactRecords, michiganRecords } from './loader'
import { michiganFipsCode } from '../michiganFipsCode'
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

export const getMichiganContact = async (
  latLong: [number, number],
  county: string,
  {cacheQuery} = {cacheQuery: false},
): Promise<ContactData | null> => {
  const fipscode = await michiganFipsCode(latLong, {cacheQuery})
  if (!fipscode) return null
  const records = await michiganRecords
  const record = records[fipscode + ':' + county.toLowerCase()]
  if (!record) return null
  const key = normalizeLocaleKey({state: 'Michigan', county: record.county, city: record.city})
  return enrichContact(record, key, 'Michigan') ?? null
}

export const toContact = async (locale: Locale): Promise<ContactData | null> => {
  const { state } = locale
  if (!isAvailableState(state)) return null

  // Need to search for Michigan Directly
  if (locale.state === 'Michigan' && locale.latLong && locale.county) {
    const contact = await getMichiganContact(locale.latLong, locale.county)
    if (contact) return contact
    console.warn(`Unable to directly geocode Michigan locale ${JSON.stringify(locale)}, fallback to inferring`)
  }

  for (const key of keys(locale as Locale<AvailableState>)) {
    const result = await getContact(state, key)
    if (result) {
      if (contactOverride[result.key]) {
        const override = {...contactOverride[result.key]}
        if (override.emails) {
          const { emailOverrideMethod } = override
          override.emails = emailOverrideMethod === 'increment' && result.emails
            ? [...override.emails, ...result.emails]
            : override.emails
        }

        // So we don't store this on our servers
        delete override.emailOverrideMethod

        return {
          ...result,
          ...override,
        }
      }

      return result
    }
  }
  return null
}

export { contactRecords }
