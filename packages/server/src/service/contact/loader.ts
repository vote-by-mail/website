import axios from 'axios'

import { State, processEnvOrThrow, AvailableState, availableStates, ImplementedState } from "../../common"
import { RawContactRecord, RawContact, ContactRecord } from "./type"
import { normalizeStates } from "./normalize"

// Local Contact Records
const version = processEnvOrThrow('ELECTION_OFFICIAL_DATA_VERSION')

const url = (state: State) => {
  const stateStr = state.toLowerCase().replace(' ', '_')
  return `https://raw.githubusercontent.com/vote-by-mail/election-official-data/${version}/public/${stateStr}.json`
}

export const loadState = async (state: AvailableState): Promise<[AvailableState, RawContact[]]> => {
  const resp = await axios.get(url(state))
  return [state, resp.data as RawContact[]]
}

export const loadStates = async (): Promise<RawContactRecord> => {
  const startTime = new Date()

  const records = await Promise.all(availableStates.map(state => loadState(state)))
  const ret = Object.fromEntries(records) as RawContactRecord

  const endTime = new Date()
  const seconds = (endTime.getTime() - startTime.getTime()) / 1000.
  console.info(`Successfully loaded contact data for ${availableStates.length} states in ${seconds} seconds`)
  return ret
}

/**
 * We ignore `null` counties if they have their respective fips code
 * in this block list.
 */
const fipsCodeCountyBlocklist = [
  // Fipscode that have null counties in election-official-data/Wisconsin.json
  // List written for version 2020-10-12
  '10201',
  '45201',
  '02201',
  '24206',
  '23206',
  '52206',
  '10211',
  '11211',
  '22211',
  '18221',
  '54221',
  '67236',
  '45241',
  '36241',
  '69252',
  '72251',
  '71251',
  '41251',
  '69261',
  '48276',
  '09281',
  '28291',
  '14292',
  '65291',
  '11291',
  '41106',
  '13106',
  '59106',
  '33108',
  '13109',
  '13111',
  '53111',
  '63116',
  '10116',
  '65131',
  '08131',
  '22136',
  '05136',
  '67142',
  '68146',
  '22147',
  '72151',
  '22151',
  '68153',
  '22153',
  '09161',
  '67161',
  '63165',
  '05171',
  '14176',
  '32176',
  '48181',
  '03186',
  '37186',
  '53186',
  '05191',
]

export const enrichFields = async (
  data: Record<string, RawContact>,
  state: ImplementedState,
): Promise<Record<string, RawContact & { key: string }>> => {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, _rec]) => {
        // Redeclaring _rec here with this hack to ignore type checking
        // errors since the true type of _rec is a Pick<ContactData> with
        // several fields (writing its type here will just make things way
        // too verbose)
        const rec = _rec as (typeof _rec) & { fipscode: string }
        if (!rec.county && !fipsCodeCountyBlocklist.includes(rec.fipscode)) {
          throw Error(`Encountered ${state} record without county field during loading`)
        }
        const { county, fipscode } = rec

        return [
          ...(county ? [`${fipscode}:${county.toLowerCase()}`] : []),
          {...rec, key}
        ]
      })
  )
}

export const contactRecords: Promise<ContactRecord> = (async () => {
  const data = await loadStates()
  return normalizeStates(data)
})()

export const michiganRecords: Promise<Record<string, RawContact & { key: string }>> = (async () => {
  return enrichFields((await contactRecords)['Michigan'], 'Michigan')
})()

export const wisconsinRecords: Promise<Record<string, RawContact & { key: string }>> = (async () => {
  return enrichFields((await contactRecords)['Wisconsin'], 'Wisconsin')
})()
