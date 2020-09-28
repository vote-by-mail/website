// The functionality implemented in this file allow us to scan sign ups
// until we have populated our collection with the information that allow
// us to simply query for that still needs to have their alloy registration
// statuses queued.
import { FirestoreService } from '../firestore'
import { RichStateInfo } from '../types'

const firestore = new FirestoreService()

/**
 * Returns true if we should scan the database in order to prepare the
 * collection for Alloy timestamps
 */
const shouldScan = async () => {
  const query = await firestore.db.collection('StateInfo')
    .where('alloy.timestamp', '>', 0)
    .limit(1)
    .get()
  return query.size === 0
}

/**
 * Queries all records in the DB modifying the alloy status of each user
 * by adding the timestamp. We do this because we didn't always have this
 * field in the past, and this field allow us to cross-check registrations
 * with a cronjob.
 */
export const scanSignupsForAlloyTimestamp = async () => {
  if (await shouldScan()) {
    const collection = await firestore.db.collection('StateInfo').select('id', 'alloy').get()
    const updates: Array<Partial<RichStateInfo> & { id: string }> = collection.docs.map(entry => {
      const data = entry.data() as RichStateInfo
      return {
        id: entry.id,
        alloy: {
          id: data.alloy?.id ?? null,
          status: data.alloy?.status ?? 'Not Found',
          // If this is undefined we won't be able to do comparison queries
          // of the last 24 hours
          timestamp: 0,
        }
      }
    })

    await firestore.batchUpdateRegistrations(updates)
  }
}

// Allow us to run the script locally
if (require.main === module) {
  scanSignupsForAlloyTimestamp()
}
