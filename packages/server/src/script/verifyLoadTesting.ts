/* eslint-disable @typescript-eslint/camelcase */
import { Logging } from '@google-cloud/logging'
import { processEnvOrThrow } from '../common'
import { MailgunHookBody, MailgunEventType } from '../service/webhooks'
import { promises as fs } from 'fs'

// We don't export/share these between verifyLoadTesting and loadEmailTesting.ts because
// each file has its own main()--so just by importing anything from a file will call
// the main function again.
interface StoredInfo {
  startTime: string
  results: Array<{
    response?: { type: 'error' | 'data', data?: string }
    error?: string
    qps: number
  }>
}

interface EntryResponse {
  data: MailgunHookBody
}

export const fetchIdStatuses = async (total: number, ids: string[], isoTimeString: string) => {
  const logging = new Logging({
    projectId: processEnvOrThrow('GCLOUD_PROJECT'),
  })

  const filter =
`jsonPayload."event-data"."user-variables".metadata =~ ${ids.map(id => `"${id}"`).join(' OR ')}

timestamp >= "${isoTimeString}"`

  console.log('Querying load test results, this might take a while...\n')
  const entries = await logging.log('mailgun-log').getEntries({ filter })

  const result: Record<MailgunEventType, number> = {
    accepted: 0,
    rejected: 0,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    complained: 0,
    stored: 0,
    list_member_uploaded: 0,
    list_member_upload_error: 0,
    list_uploaded: 0,
  }
  // Events that were successfully stored in our logs
  let inOurLogs = 0

  entries.flat().forEach((e: unknown) => {
    const { data } = e as EntryResponse
    result[data['event-data'].event] += 1
    inOurLogs += 1
  })

  console.log(
`Of all ${total} emails sent, we successfully got from trpc ${ids.length} IDs.
In our logs (Google Logging) ${total - inOurLogs} are absent (Mailgun hasn't send these emails yet).

Details of messages sent and stored in Google Logging:
accepted: ${result['accepted']}
rejected: ${result['rejected']}
delivered: ${result['delivered']}
failed: ${result['failed']}
opened: ${result['opened']}
clicked: ${result['clicked']}
unsubscribed: ${result['unsubscribed']}
complained: ${result['complained']}
stored: ${result['stored']}
list_member_uploaded: ${result['list_member_uploaded']}
list_member_upload_error: ${result['list_member_upload_error']}
list_uploaded: ${result['list_uploaded']}\n\n`)
}

/**
 * Fetches detailed information about registration sending statuses, returning
 * for example, how many email were delivered to an inbox, or how many failed
 * or are still absent from sending.
 *
 * By default this function defaults to the latest log from the load Registration Testings,
 * but it is possible to fetch for a specific file by passing its name.
 *
 * @param customFileName instead of fetching the result from the latest
 * load test execution, fetches information of the given file, e.g.
 * `loadRegistrationTesting-1600289555.json`
 */
const main = async (customFile?: string) => {
  let file: string
  if (customFile) {
    file = customFile
  } else {
    // Get last log from loadRegistrationTesting
    const dirFiles = await fs.readdir(`${__dirname}/data/`)
    const loadTestingLogs = dirFiles.filter(f => f.match(/loadRegistrationTesting-/))
    const length = loadTestingLogs.length

    file = loadTestingLogs[length - 1]
  }

  const fileContent = await fs.readFile(`${__dirname}/data/${file}`, { encoding: 'utf-8' })
  const storedInfo = JSON.parse(fileContent) as StoredInfo
  const ids = storedInfo.results.map(r => {
    if (r.response?.data) return r.response.data
    return null
  }).filter(str => !!str) as string[] // Removes empty/null elements

  await fetchIdStatuses(
    storedInfo.results.length,
    ids,
    storedInfo.startTime,
  )
}

main()
