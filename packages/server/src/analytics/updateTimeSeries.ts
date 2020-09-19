import { v3 as gcm } from '@google-cloud/monitoring'
import { AnalyticsStorage } from './storage'
import { processEnvOrThrow, implementedStates, getStateAbbr } from '../common'
import { calculateSignups } from './logic'
import { FirestoreService } from '../service/firestore'

// Remember to allow monitoring on the Google Cloud Platform and also to
// ensure a valid workspace/dashboard is available in order to see these
// charts in action.
//
// Also be sure to set the right IAM permissions for "firebase-adminsdk" at :
// https://console.cloud.google.com/iam-admin/iam?project=vbm-staging-281822
//
// This is only needed if you're using firebase instead of firestore in your
// project, ideally in this scenario "firebase-adminsdk" would have the role
// "Monitoring Editor" for these metrics to work.

const firestore = new FirestoreService()
const client = new gcm.MetricServiceClient()
const projectName = processEnvOrThrow('GCLOUD_PROJECT')
const projectPath = client.projectPath(projectName)
const baseMetricUrl = 'custom.googleapis.com'

// Not using RAX (Retry Axios) since the request is done through @google-cloud/monitoring
//
// Monitoring seems to be throwing a lot of internal errors as our metrics increase in
// size.
const retry = async <T>(promise: () => Promise<T>, times = 4): Promise<T> => {
  for (let i = 0; i < times; i++) {
    try {
      return promise()
    } catch(e) {
      console.error(e)
    }
  }

  throw new Error('Could not complete request')
}

/**
 * Updates a metric with the given values.
 *
 * @param pathPrefix Allows to update a sub-metric, i.e. per-state/orgs metrics,
 * by appending the prefix before the path. If null defaults to update the
 * default metric.
 * @param todaySignups New value for the metric today sign ups.
 * @param totalSignups New value for the metric total sign ups.
 * @param now The time this query was executed.
 */
const updateMetric = async (
  pathPrefix: string | null,
  todaySignups: number,
  totalSignups: number,
  now: Date,
) => {
  await retry(() => client.createTimeSeries({
    name: projectPath,
    timeSeries: [{
      metric: { type: `${baseMetricUrl}/${pathPrefix ? `${pathPrefix}/` : ''}daily_sign_ups` },
      resource: { type: 'global' },
      points: [{
        interval: {
          // Google timestamps uses seconds instead of ms (default JS stamp)
          // we divide valueOf by 1000 to avoid issues
          endTime: { seconds: now.valueOf() / 1000 },
        },
        value: { int64Value: todaySignups },
      }],
    }],
  }))

  await retry(() => client.createTimeSeries({
    name: projectPath,
    timeSeries: [{
      metric: { type: `${baseMetricUrl}/${pathPrefix ? `${pathPrefix}/` : ''}total_sign_ups` },
      resource: { type: 'global' },
      points: [{
        interval: {
          // Google timestamps uses seconds instead of ms (default JS stamp)
          // we divide valueOf by 1000 to avoid issues
          endTime: { seconds: now.valueOf() / 1000 },
        },
        value: { int64Value: totalSignups },
      }],
    }],
  }))
}

export const updateTimeSeries = async () => {
  const storage = new AnalyticsStorage()
  await storage.initializeOrSync()
  const now = new Date()

  const { lastQueryTime } = storage.data
  const { lastQueryTime: stateLastQueryTime } = storage.data.state
  const { lastQueryTime: orgLastQueryTime } = storage.data.org
  const snapshot = await firestore.getSignups(lastQueryTime, stateLastQueryTime, orgLastQueryTime)
  const newValues = calculateSignups(storage.data, snapshot, now)

  await updateMetric(null, newValues.todaySignups, newValues.totalSignups, now)

  for (const state of implementedStates) {
    const stateAbbr = getStateAbbr(state)?.toLowerCase() as string
    const { todaySignups, totalSignups } = newValues.state.values[state]

    await updateMetric(stateAbbr, todaySignups, totalSignups, now)
  }

  for (const org of Object.keys(newValues.org.values)) {
    const orgData = newValues.org.values[org]
    if (orgData) {
      await updateMetric(org, orgData.todaySignups, orgData.totalSignups, now)
    }
  }

  await storage.update(newValues)
}
