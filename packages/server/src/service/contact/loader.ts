import axios from 'axios'

import { State, processEnvOrThrow, AvailableState, availableStates } from "../../common"
import { RawContactRecord, RawContact, ContactRecord } from "./type"
import { normalizeStates } from "./normalize"

// Local Contact Records
const version = processEnvOrThrow('ELECTIONS_OFFICIALS_VERSION')

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

export const loadMichigan = async (
  data: Record<string, RawContact>
): Promise<Record<string, RawContact & { key: string }>> => {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, rec]) => {
        if (!rec.county) throw Error('Encountered Michigan record without count field during loading')

        return [
          (rec as { fipscode: string }).fipscode + ':' + rec.county.toLowerCase(),
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
  return loadMichigan((await contactRecords)['Michigan'])
})()
