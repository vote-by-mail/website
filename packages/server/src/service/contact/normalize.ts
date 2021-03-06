import { RawContactRecord, ContactRecord, RawContact, OptionalLocale } from "./type"
import { AvailableState } from "../../common"
import { mandatoryTransform } from "./transformers"
import { isE164 } from '../../common/util'

const lowerCase = <T>(f: (_: T) => string): (_: T) => string => {
  return (arg: T) => {
    return f(arg).toLowerCase()
  }
}

/**
 * Every key is of the form `city + ':' + county`
 * */
const normalizeKey = lowerCase(({ state, county, city }: OptionalLocale): string => {
  switch(state) {
    // Only county
    case 'Arizona':
    case 'Florida':
    case 'Georgia':
    case 'Kansas':
    case 'Minnesota':
    case 'Nebraska':
    case 'New York':
    case 'North Carolina':
    case 'North Dakota':
    case 'Oklahoma':
    case 'West Virginia':
    case 'Wyoming': {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return ':' + county!
    }

    // Only city
    case 'Maine':
    case 'Massachusetts':
    case 'New Hampshire': {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return city! + ':'
    }

    // hybrid count or city
    case 'Maryland': // Baltimore city is independent of county
    case 'Virginia': // Alexandria, Fairfax are independent of county.  All end in "City"
    case 'Nevada': {  // Carson City is independent of county
      return (city ?? '') + ':' + (county ?? '')
    }

    // both city and county
    case 'Michigan': {
      return city + ':' + county
    }
    case 'Wisconsin': {
      return city + ':' + (county ?? '')
    }
  }
})
/* eslint-enable @typescript-eslint/no-non-null-assertion */

export const normalizeLocaleKey = ({state, city, county}: OptionalLocale): string => {
  return normalizeKey({
    state,
    city: city ? mandatoryTransform(city.toLowerCase()) : undefined,
    county: county ? mandatoryTransform(county.toLowerCase()) : undefined,
  })
}

export const normalizeState = (
  state: AvailableState,
  contacts: RawContact[]
): Record<string, RawContact> => {
  const array = contacts.map(
    contact => {
      // Do not load server if any fax number is not E164 (needed for Twillio)
      contact.faxes && contact.faxes.forEach(
        (fax) => {
          if (!isE164(fax)) throw Error(`fax number ${fax} in state ${state} is not E164`)
        }
      )
      return [
        normalizeLocaleKey({
          state,
          city: contact.city,
          county: contact.county,
        }),
        contact,
      ]
    }
  )
  return Object.fromEntries(array)
}

export const normalizeStates = (records: RawContactRecord): ContactRecord => {
  const rawArray  = Object.entries(records) as Array<[AvailableState, RawContact[]]>
  const array = rawArray.map(
    ([state, contactDatas]) => [
      state,
      normalizeState(state, contactDatas)
    ]
  )
  return Object.fromEntries(array)
}
