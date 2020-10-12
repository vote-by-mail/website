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

export const loadStateCounties = async (
  data: Record<string, RawContact>,
  state: ImplementedState,
): Promise<Record<string, RawContact & { key: string }>> => {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, rec]) => {
        // Since the ArcGIS for wisconsin has some data that the election
        // officials data does not have (and vice versa) we can expect some
        // lack of data regarding counties.
        if (!rec.county && state !== 'Wisconsin') throw Error(`Encountered ${state} record without county field during loading`)

        return [
          ...(
            rec.county
              ? [(rec as { fipscode: string }).fipscode + ':' + rec.county.toLowerCase()]
              : []
          ),
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
  return loadStateCounties((await contactRecords)['Michigan'], 'Michigan')
})()

export const wisconsinRecords: Promise<Record<string, RawContact & { key: string }>> = (async () => {
  return loadStateCounties((await contactRecords)['Wisconsin'], 'Wisconsin')
})()
