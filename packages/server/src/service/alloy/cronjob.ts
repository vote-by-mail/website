import { FirestoreService } from '../firestore'
import { unfinishedRegistrationStatus, StateInfoForAlloy, recheckRegistration } from './recheck'
import { processEnvOrThrow } from '../../common'
import { RichStateInfo } from '../types'

const alloyRecheckInterval: number = +processEnvOrThrow('ALLOY_RECHECK_INTERVAL')
const firestore = new FirestoreService()

export const crossCheckRegistrationsCronjob = async () => {
  const now = new Date()
  const inInterval = now.valueOf() - alloyRecheckInterval
  const registrations = await firestore.db.collection('StateInfo')
    .where('alloy.status', 'in', unfinishedRegistrationStatus)
    .where('alloy.timestamp', '<=', inInterval)
    .select('id', 'alloy', 'name', 'nameParts', 'address', 'birthdate')
    .limit(500)
    .get()

  const updates: Array<Partial<RichStateInfo> & { id: string }> = []
  for (let i = 0; i < registrations.size; i++) {
    const data = registrations.docs[i].data() as StateInfoForAlloy
    const alloy = await recheckRegistration(data)
    if (alloy) {
      updates[i] = {
        id: data.id,
        alloy: {
          status: alloy.status ?? 'Not Found',
          // It will throw errors if undefined
          id: alloy.id ?? null,
          timestamp: alloy.timestamp ?? 0,
        },
      }
    }
  }

  // The filter removes empty items
  await firestore.batchUpdateRegistrations(updates.filter(r => !!r))
}
