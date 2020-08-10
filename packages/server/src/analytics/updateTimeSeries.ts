import { v3 as gcm } from '@google-cloud/monitoring'
import { FirestoreService } from '../service/firestore'
import { storage } from './storage'
import { processEnvOrThrow } from '../common'

// Remember to allow monitoring on the Google Cloud Platform and also to
// ensure a valid workspace/dashboard is available in order to see these
// charts in action.
//
// Also be sure to set the right IAM permissions for "firebase-adminsdk" at :
// https://console.cloud.google.com/iam-admin/iam?project=vbm-staging-281822
//
// Ideally "firebase-adminsdk" should have the role "Monitoring Editor" for
// these metrics to work

const client = new gcm.MetricServiceClient()
const projectName = processEnvOrThrow('GCLOUD_PROJECT')
const projectPath = client.projectPath(projectName)
const firestore = new FirestoreService()
const baseMetricUrl = 'custom.googleapis.com'

export const updateTimeSeries = async () => {
  const now = new Date()
  const startTime = storage.yesterdayZeroed
  const {
    lastQueryTime: storedLastQueryTime,
    yesterdaySignups: storedYesterdaySignups,
    totalSignups: storedTotalSignups,
  } = await storage.data()

  const collection = firestore.db.collection('StateInfo')

  // We only select 'created' when doing these metrics, to avoid fetching
  // needless information
  const query = collection.where('created', '>=', storedLastQueryTime).select('created')
  const snapshot = await query.get()
  console.log(snapshot.size)
  let newYesterdaySignups = storedYesterdaySignups
  let newTotalSignups = storedTotalSignups

  snapshot.forEach(
    d => d.createTime.seconds > (startTime.valueOf() / 1000)
      ? newYesterdaySignups++
      : newTotalSignups++
  )
  newTotalSignups += (newYesterdaySignups - storedYesterdaySignups)

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

  await storage.update(newTotalSignups, newYesterdaySignups, now)
}
