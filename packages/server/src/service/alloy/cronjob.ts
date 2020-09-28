import { FirestoreService } from '../firestore'
import { unfinishedRegistrationStatus, StateInfoForAlloy, recheckRegistration } from './recheck'
import { processEnvOrThrow } from '../../common'
import { RichStateInfo } from '../types'
import { scanSignupsForAlloyTimestamp } from './scanSignups'

const alloyRecheckInterval: number = +processEnvOrThrow('ALLOY_RECHECK_INTERVAL')
const firestore = new FirestoreService()

export const crossCheckRegistrationsCronjob = async () => {
  await scanSignupsForAlloyTimestamp()

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
          ...alloy,
          // It will throw errors if undefined
          id: alloy.id ?? null,
        },
      }
    }
  }

  // The filter removes empty items
  await firestore.batchUpdateRegistrations(updates.filter(r => !!r))
}
