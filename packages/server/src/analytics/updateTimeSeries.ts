import { v3 as gcm } from '@google-cloud/monitoring'
import { analyticsStorage } from './storage'
import { processEnvOrThrow } from '../common'
import { analyticsLogic } from './logic'
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
  await analyticsStorage.initializeOrSync()
  const now = new Date()

  const { lastQueryTime } = analyticsStorage.data
  const snapshot = await firestore.getSignups(lastQueryTime)
  const { yesterdaySignups, totalSignups } = analyticsLogic.calculateSignups(snapshot)

  await client.createTimeSeries({
    name: projectPath,
    timeSeries: [{
      metric: { type: `${baseMetricUrl}/past_day_sign_ups` },
      resource: { type: 'global' },
      points: [{
        interval: {
          // Google timestamps uses seconds instead of ms (default JS stamp)
          // we divide valueOf by 1000 to avoid issues
          endTime: { seconds: now.valueOf() / 1000 },
        },
        value: { int64Value: yesterdaySignups },
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

  await analyticsStorage.update(totalSignups, yesterdaySignups, now.valueOf())
}
