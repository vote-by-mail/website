import { v3 as gcm } from '@google-cloud/monitoring'
import { FirestoreService } from '../service/firestore'
import { analyticsStorage } from './storage'
import { processEnvOrThrow } from '../common'

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

const client = new gcm.MetricServiceClient()
const projectName = processEnvOrThrow('GCLOUD_PROJECT')
const projectPath = client.projectPath(projectName)
const firestore = new FirestoreService()
const baseMetricUrl = 'custom.googleapis.com'

export const updateTimeSeries = async () => {
  const now = new Date()
  const startTime = analyticsStorage.midnightYesterday

  const {
    lastQueryTime: storedLastQueryTime,
    yesterdaySignups: storedYesterdaySignups,
    totalSignups: storedTotalSignups,
  } = await analyticsStorage.data()

  const snapshot = await firestore.getSignups(storedLastQueryTime)

  let newYesterdaySignups = storedYesterdaySignups
  let newTotalSignups = storedTotalSignups

  // We process this query based on the value of analyticsStorage.isFirstQuery
  //
  // If true, we'll have to manually iterate through the array in order to
  // detect which records happened yesterday.
  //
  // Otherwise we can easily increment newYesterdaySignups/newTotalSignups
  // based on the size of the snapshot.
  if (await analyticsStorage.isFirstQuery()) {
    snapshot.forEach(d => {
      if (d.createTime.seconds >= (startTime.valueOf() / 1000)) {
        newYesterdaySignups++
      }
    })
    newTotalSignups = snapshot.size
  } else {
    newYesterdaySignups += snapshot.size
    newTotalSignups += snapshot.size
  }

  await client.createTimeSeries({
    name: projectPath,
    timeSeries: [{
      metric: { type: `${baseMetricUrl}/past_day_sign_ups` },
      resource: { type: 'global' },
      points: [{
        interval: {
          endTime: { seconds: now.valueOf() / 1000 },
        },
        value: { int64Value: newYesterdaySignups },
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
          endTime: { seconds: now.valueOf() / 1000 },
        },
        value: { int64Value: newTotalSignups },
      }],
    }],
  })

  await analyticsStorage.update(newTotalSignups, newYesterdaySignups, now)
}
