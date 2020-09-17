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

interface QueryResponse {
  response?: RpcRet<string>
  error?: unknown
  ms: number
  qps: number
  duration: number
}

/**
 * Send N amount of registrations per second through a given duration.
 *
 * @param qps Amount of registrations to be sent per seconds
 * @param duration Duration of this cycle in seconds
 */
const loadRegistrationTesting = async (qps: number, duration: number): Promise<QueryResponse[]> => {
  const stateInfo = await sampleStateInfo('Florida')
  stateInfo.email = fakeEmail
  // Creates an array that allow us to serialize N amount of queries per second through the given duration
  const startTimes = Array(duration * qps).fill(0).map((_, index) => index * (1000 / qps))
  console.log(`Starting sending cycle of ${qps * duration} registrations (queries per second: ${qps}, duration: ${duration} seconds) to test MG limits.`)

  return Promise.all(
    startTimes.map((ms, key) => delay(
      async () => {
        if (key === (qps * duration) -1) {
          console.log(`Finished sending cycle.`)
        }

        // We need to catch any error since a single uncaught exception (like a timeout)
        // will stop the entire script.
        try {
          return {
            response: await client.register(stateInfo, { uid: 'fakeVoter' }),
            ms,
            qps,
            duration,
          }
        } catch(error) {
          return {
            error: `${error}`, // Always converts errors to strings
            duration,
            ms,
            qps,
          }
        }
      },
      ms
    ))
  )
}


export interface LoadTestStoredInfo {
  startTime: string
  results: Array<QueryResponse>
}

const main = async () => {
  // Prevents contact message from showing in the middle of one of the above
  // functions.
  await contactRecords

  const startTime = new Date()
  const timeStamp = Math.floor(startTime.getTime() / 1000)

  const results = [
    ...await loadRegistrationTesting(1, 20),  // One query per second
    ...await loadRegistrationTesting(3, 20),  // Three queries per second
    ...await loadRegistrationTesting(10, 20), // Ten queries per second
  ]

  console.log('Cycles completed, saving logs')

  const file = `${__dirname}/data/loadRegistrationTesting-${timeStamp}.json`
  const storedInfo: LoadTestStoredInfo = {
    startTime: startTime.toISOString(),
    results,
  }
  // Formats the content of the file (it's very likely that the file is going to be read by humans)
  const content = JSON.stringify(storedInfo, null, 2)

  await fs.writeFile(file, content, { encoding: 'utf-8' })

  console.log(`Saved logs to ${file}`)
}

if (require.main === module) {
  main()
}
