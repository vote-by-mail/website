import { FirestoreService } from '../firestore'
import { unfinishedRegistrationStatus, recheckRegistration } from './recheck'
import { processEnvOrThrow } from '../../common'
import { RichStateInfo } from '../types'
import Bottleneck from 'bottleneck'

const alloyRecheckInterval: number = +processEnvOrThrow('ALLOY_RECHECK_INTERVAL')
const firestore = new FirestoreService()
const limiter = new Bottleneck({
  minTime: 100,
  // We can send up to 200 requests per second to alloy, halving this value
  //  for the cronjob so we don't affect users using our app.
  maxConcurrent: 100,
})

type InfoWithId = RichStateInfo & { id: string }

const throttleRecheckRegistration = limiter.wrap(recheckRegistration)

export const crossCheckRegistrationsCronjob = async () => {
  const now = new Date()
  const inInterval = now.valueOf() - alloyRecheckInterval
  const queryResult = await firestore.db.collection('StateInfo')
    .where('alloy.status', 'in', unfinishedRegistrationStatus)
    .where('alloy.timestamp', '<=', inInterval)
    .select('id', 'alloy', 'name', 'nameParts', 'address', 'birthdate')
    .limit(500)
    .get()

  const updates: Array<Partial<RichStateInfo> & { id: string }> = []
  const registrations = queryResult.docs.map(e => e.data() as InfoWithId)
  const promises = registrations.map((info, index) => {
    return throttleRecheckRegistration(info)
      .then(alloy => {
        if (alloy) {
          updates[index] = {
            id: info.id,
            alloy: {
              status: alloy.status ?? 'Not Found',
              // It will throw errors if undefined
              id: alloy.id ?? null,
              timestamp: alloy.timestamp ?? 0,
            },
          }
        }
      })
  })

  await Promise.all(promises)

  // The filter removes empty items
  await firestore.batchUpdateRegistrations(updates.filter(r => !!r))
}
