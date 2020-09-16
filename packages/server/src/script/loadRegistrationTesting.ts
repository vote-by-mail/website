import { sampleStateInfo } from '../service/letter'
import { contactRecords } from '../service/contact'
import { makeClient, httpConnector } from '@tianhuil/simple-trpc/dist/client'
import { IVbmRpc, processEnvOrThrow, wait } from '../common'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'
import { TimeoutError } from '@tianhuil/simple-trpc/dist/timedFetch'
import { RpcRet, IError } from '@tianhuil/simple-trpc/dist/type'

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

let timeouts = 0
let errors = 0

/** Store the amount of timeouts and errors that happened in this test */
const storeLog = async () => {
  const file = `${__dirname}/data/loadEmailTesting.log`
  const content =
`In the last test ${timeouts} timeouts happened, and ${errors} errors occurred.`

  return fs.writeFile(file, content, { encoding: 'utf-8' })
}

/**
 * Store all returned IDs so we can fetch their status later on.
 *
 * @param qps The .json file is named after the qps, so we can store the result
 * of multiple batches simultaneously
 * @param duration The amount of time in seconds this cycle lasted
 * @param responses The responses from trpc.register, we parse them to store
 * registration IDs
 * @param startTime used to speed up queries, we'll only query events that
 * happened after this date/time.
 */
const storeCycleResults = async (
  qps: number,
  duration: number,
  responses: Array<RpcRet<string> | IError>,
  startTime: Date,
) => {
  const file = `${__dirname}/data/loadEmailTesting_QPS${qps}.json`
  const ids = responses.map(resp => {
    if (resp.type === 'data') return resp.data
    return null
  }).filter(str => !!str) // removes null elements
  const content = {
    total: qps * duration,
    ids,
    startTime: startTime.toISOString(),
  }

  return fs.writeFile(file, JSON.stringify(content), { encoding: 'utf-8' })
}

/**
 * Send N amount of registrations per second through a given duration.
 *
 * @param qps Amount of registrations to be sent per seconds
 * @param duration Duration of this cycle in seconds
 */
const loadRegistrationTesting = async (qps: number, duration: number) => {
  const startTime = new Date()
  const stateInfo = await sampleStateInfo('Florida')
  stateInfo.email = fakeEmail
  // Creates an array that has an interval of one second until we reach duration
  const startTimes = Array(duration).fill(0).map((_, index) => index * 1000)

  console.log(`Starting sending cycle of ${qps * duration} registrations (queries per second: ${qps}, duration: ${duration} seconds) to test MG limits.`)


  // Holds promises acquired from each qps cycle so we can process them
  // later.
  const promises = startTimes.map(time => delay(
    () => {
      const qpsCycle = Array(qps).fill(null).map(() => {
        // We don't await for registrations to be processed here, however,
        // we manually handle errors since uncaught exceptions would
        // stop the entire script.
        return client.register(stateInfo, { uid: 'fakeVoter' })
          .then(r => {
            if (r.type !== 'data') errors += 1
            return r
          })
          .catch((e) => {
            if (e instanceof TimeoutError) {
              timeouts += 1
            } else {
              errors += 1
            }

            return { type: 'error', message: 'Internal error happened.'} as IError
          })
      })

      const seconds = time / 1000
      if (seconds && seconds % 5 === 0) console.log(`${seconds} seconds have passed since the beginning of this cyle.`)
      if (seconds === duration - 1) console.log('Cycle finished, waiting for promises...')
      return Promise.all(qpsCycle)
    },
    time,
  ))


  const responses = (await Promise.all(promises)).flat()
  console.log('Promises fulfilled! Storing information about this cycle...')

  await storeCycleResults(qps, duration, responses, startTime)
  console.log('Cycle stored!')
}

const main = async () => {
  // Prevents contact message from showing in the middle of one of the above
  // functions.
  await contactRecords

  // One query per second
  await loadRegistrationTesting(1, 20)
  // Three queries per second
  await loadRegistrationTesting(3, 20)
  // Ten queries per second
  await loadRegistrationTesting(10, 20)

  console.log(`Total timeouts: ${timeouts}, total internal errors: ${errors}. Saving log...`)
  await storeLog()
  console.log(`Saved this information at ${__dirname}/data/loadEmailTesting.log`)

  console.log('IDs and errors where stored in the data folder, you can run ./verifyLoadTesting.ts to get accepted/rejected statuses (it might take a while until all registrations are sent from used API\'s queues).')
}

main()
