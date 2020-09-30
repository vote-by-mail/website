import { Logging } from '@google-cloud/logging'
import { processEnvOrThrow } from '../common'
import { MailgunHookBody, MailgunEventReason } from '../service/webhooks'
import { promises as fs } from 'fs'

interface EntryResponse {
  data: MailgunHookBody
}

/**
 * * The first is the starting date (inclusive) of the script;
 * * Likewise, the second can be the end date (inclusive), or null if we
 * want to fetch all records from the starting point until the present moment;
 * * The third is a list of MGEventReason to be ignored while fetching logs;
 */
export type MGFetchErrorsArgs = [Date, Date | null, MailgunEventReason[]]
// Only used to ease importing through require()
interface MGFetchErrorsArgsExport { args: MGFetchErrorsArgs }

const { args } = process.env.CI
  ? require('./data/mgConditions.sample.ts') as MGFetchErrorsArgsExport
  : require('./data/mgConditions.nogit.ts') as MGFetchErrorsArgsExport

const projectId = processEnvOrThrow('GCLOUD_PROJECT')

const fetchMGErrors = async (
  fromIsoStamp: string,
  untilIsoStamp: string | null,
  ignoredEventReasons: MailgunEventReason[] = [],
) => {
  const logging = new Logging({ projectId })

  const filter =
`logName="projects/${projectId}/logs/mailgun-log"
severity=(WARNING OR ERROR OR CRITICAL OR ALERT OR EMERGENCY)

timestamp >= "${fromIsoStamp}"
${untilIsoStamp ? `timestamp <= ${untilIsoStamp}` : ''}`

  console.log('Querying all MG errors in our logs during the period, this might take a while...\n')
  // The response comes in a nested array, flattening it to ease iterations
  const entries = (await logging.log('mailgun-log').getEntries({ filter })).flat() as EntryResponse[]

  const results: Record<string, string[]> = {}

  entries.forEach(({ data }) => {
    // Do not resend since the email doesn't exist, apparently the message
    // for this event vary depending on the destination
    //
    // We don't use the delivery-status code here since email providers'
    // implementation differ slightly from each other, for example at Google
    // Gmail we have 550 for non existent emails, but on Yahoo the same error
    // is represented by 554.
    const message = data['event-data']?.['delivery-status']?.message

    // Message can only be undefined/null in staging/dev environments, this
    // happens when we've used MG's webhook testing hooks before (they don't
    // contain delivery-statuses)
    if (!message) {
      return
    }

    // Very likely that the email was not typed correctly according to:
    // https://help.mailgun.com/hc/en-us/articles/360012750413-What-Does-This-Error-Mean-498-499-No-MX-for-domain-tld-
    if (message.indexOf('No MX for ') >= 0) {
      return
    }

    // At https://documentation.mailgun.com/en/latest/api-events.html?highlight=user%20variables#event-structure
    // It seems that this is also the default message from Google's Gmail
    if (message.indexOf('5.1.1 The email account that you tried to reach does not exist.') >= 0) {
      return
    }
    // Used by Yahoo
    if (message.indexOf('delivery error: dd Not a valid recipient') >= 0) {
      return
    }

    // If the event.reason is on the ignoreReason list we don't resend the email as well
    if (ignoredEventReasons.indexOf(data['event-data'].reason) >= 0) {
      return
    }

    const metadata: {uid: string} = JSON.parse(data['event-data']['user-variables'].metadata)

    if (results[data['event-data'].event]) {
      results[data['event-data'].event].push(metadata.uid)
    } else {
      results[data['event-data'].event] = [metadata.uid]
    }
  })

  return results
}

/**
 * @param from The starting point of the query, remember that month 0 == January
 * @param until The ending point of the query, can be null to query until the current time
 * @param ignoredEventReasons Ignores the reasons inside this array, for example
 * to avoid fetching the IDs for bounce events just add 'bounce' to this array.
 */
const main = async (from: Date, until: Date | null, ignoredEventReasons: MailgunEventReason[] = []) => {
  const now = new Date()
  const executionTimeStamp = now.valueOf()

  const results = await fetchMGErrors(
    from.toISOString(),
    until?.toISOString() ?? null,
    ignoredEventReasons,
  )

  const file = `${__dirname}/data/fetchMGErrors-${executionTimeStamp}.json`
  const fileJSON = {
    executionTime: now.toISOString(),
    from: from.toISOString(),
    until: until?.toISOString() ?? null,
    ignoredEventReasons,
    results,
  }

  // Formats the content of the file (it's very likely that the file is going to be read by humans)
  const fileContent = JSON.stringify(fileJSON, null, 2)

  await fs.writeFile(file, fileContent, { encoding: 'utf-8' })
  console.log(`Saved results at ${file}.`)
  console.log(`You can send these with the resend sign ups tools, e.g. ['id', 'in', [...results.ids]]`)
}

if (require.main === module) {
  main(args[0], args[1], args[2])
}
