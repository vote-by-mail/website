import { sampleStateInfo } from '../service/letter'
import { contactRecords } from '../service/contact'
import { makeClient, httpConnector } from '@tianhuil/simple-trpc/dist/client'
import { IVbmRpc, processEnvOrThrow, wait } from '../common'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'
import { RpcRet } from '@tianhuil/simple-trpc/dist/type'

const serverUrl = processEnvOrThrow('REACT_APP_SERVER')
const timeout = parseInt(processEnvOrThrow('REACT_APP_TIMEOUT'))

export const client = makeClient<IVbmRpc>(
  httpConnector(serverUrl, { timeout, fetch })
)

const fakeEmail = 'fake_voter@votebymail.io'

const delay = async <T>(fn: () => Promise<T>, ms: number): Promise<T> => {
  await wait(ms)
  return fn()
}
/**
 * Send N amount of registrations per second through a given duration.
 *
 * @param qps Amount of registrations to be sent per seconds
 * @param duration Duration of this cycle in seconds
 */
const loadRegistrationTesting = async (qps: number, duration: number): Promise<RpcRet<string>[]> => {
  const stateInfo = await sampleStateInfo('Florida')
  stateInfo.email = fakeEmail
  // Creates an array that has an interval of one second until we reach duration
  const startTimes = Array(duration * qps).fill(0).map((_, index) => index * 1000)

  console.log(`Starting sending cycle of ${qps * duration} registrations (queries per second: ${qps}, duration: ${duration} seconds) to test MG limits.`)

  return Promise.all(
    startTimes.map(ms => delay(
      () => {
        const ret = client.register(stateInfo, { uid: 'fakeVoter' })
        return {
          ...ret,
          ms,
          qps,
          duration,
        }
      },
      ms
    ))
  )
}

const main = async () => {
  // Prevents contact message from showing in the middle of one of the above
  // functions.
  await contactRecords

  const timeStamp = Math.floor((new Date().getTime())/1000)

  const reuslts = [
    ...await loadRegistrationTesting(1, 20),  // One query per second
    ...await loadRegistrationTesting(3, 20),  // Three queries per second
    ...await loadRegistrationTesting(10, 20),  // Ten queries per second
  ]

  const file = `${__dirname}/data/loadEmailTesting-${timeStamp}.json`
  fs.writeFile(file, JSON.stringify(reuslts), { encoding: 'utf-8' })
}

main()
