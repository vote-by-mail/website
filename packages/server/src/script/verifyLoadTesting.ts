/* eslint-disable @typescript-eslint/camelcase */
import { Logging } from '@google-cloud/logging'
import { processEnvOrThrow } from '../common'
import { safeReadFile } from '../service/util'
import { MailgunHookBody, MailgunEventType } from '../service/webhooks'

// We don't export/share these between verifyLoadTesting and loadEmailTesting.ts because
// each file has its own main()--so just by importing anything from a file will call
// the main function again.
interface StoredFile {
  total: number
  ids: string[]
  startTime: string
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

  console.log('Querying cycle results, this might take a while...\n')
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
`Of all ${total} emails sent, we successfully stored the IDs for ${ids.length} in our file.
In our logs (Google Logging) ${total - inOurLogs} are absent (Mailgun hasn't send these emails yet).

Detailed results:
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

const fetchResultOfQPSFile = async (qps: number) => {
  const rawFile = await safeReadFile(`${__dirname}/data/loadEmailTesting_QPS${qps}.json`)
  const stored = JSON.parse(rawFile.toString('utf-8')) as StoredFile

  await fetchIdStatuses(stored.total, stored.ids, stored.startTime)
}

// Fetches batch results for all the given QPS values used in the previous
// execution
const main = async (qpsCycles: number[]) => {
  for (const qps of qpsCycles) {
    await fetchResultOfQPSFile(qps)
  }
}

// The same QPS used at loadEmailTesting.ts
main([1, 3, 10])
