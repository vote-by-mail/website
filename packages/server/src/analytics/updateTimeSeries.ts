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

export const updateTimeSeries = async () => {
  const storage = new AnalyticsStorage()
  await storage.initializeOrSync()
  const now = new Date()

  const { lastQueryTime } = storage.data
  const { lastQueryTime: stateLastQueriedTime } = storage.data.state
  const snapshot = await firestore.getSignups(lastQueryTime, stateLastQueriedTime)
  const { todaySignups, totalSignups, state } = calculateSignups(
    storage.data,
    snapshot,
    now,
  )

  await client.createTimeSeries({
    name: projectPath,
    timeSeries: [{
      metric: { type: `${baseMetricUrl}/daily_sign_ups` },
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
  })

  await client.createTimeSeries({
    name: projectPath,
    timeSeries: [{
      metric: { type: `${baseMetricUrl}/total_sign_ups` },
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
  })

  for (const _state of implementedStates) {
    const stateAbbr = getStateAbbr(_state)?.toLowerCase() as string

    await client.createTimeSeries({
      name: projectPath,
      timeSeries: [{
        metric: { type: `${baseMetricUrl}/${stateAbbr}/daily_sign_ups` },
        resource: { type: 'global' },
        points: [{
          interval: {
            // Google timestamps uses seconds instead of ms (default JS stamp)
            // we divide valueOf by 1000 to avoid issues
            endTime: { seconds: now.valueOf() / 1000 },
          },
          value: { int64Value: state.todaySignups[_state] },
        }],
      }],
    })

    await client.createTimeSeries({
      name: projectPath,
      timeSeries: [{
        metric: { type: `${baseMetricUrl}/${stateAbbr}/total_sign_ups` },
        resource: { type: 'global' },
        points: [{
          interval: {
            // Google timestamps uses seconds instead of ms (default JS stamp)
            // we divide valueOf by 1000 to avoid issues
            endTime: { seconds: now.valueOf() / 1000 },
          },
          value: { int64Value: state.totalSignups[_state] },
        }],
      }],
    })
  }

  await storage.update(totalSignups, todaySignups, state, now.valueOf())
}
