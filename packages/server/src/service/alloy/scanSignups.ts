// The functionality implemented in this file allow us to scan sign ups
// until we have populated our collection with the information that allow
// us to simply query for that still needs to have their alloy registration
// statuses queued.
import { FirestoreService } from '../firestore'
import { RichStateInfo } from '../types'
import { promises as fs } from 'fs'

const firestore = new FirestoreService()

const readLastTimestamp = async (): Promise<number> => {
  try {
    const file = await fs.readFile(`${__dirname}/timestamp`, 'utf-8')
    return +file.toString()
  } catch(e) {
    // When the error is not because the file doesn't exist we throw it,
    // otherwise just return 0 (so we can build a very old Date timestamp)
    if (e.code !== 'ENOENT') {
      throw(e)
    }

    return 0
  }
}

const saveLastTimestamp = async (timestamp: number) => {
  await fs.writeFile(`${__dirname}/timestamp`, `${timestamp}`, { encoding: 'utf-8' })
}

/**
 * Queries all records in the DB modifying the alloy status of each user
 * by adding the timestamp. We do this because we didn't always have this
 * field in the past, and this field allow us to cross-check registrations
 * with a cronjob.
 */
export const scanSignupsForAlloyTimestamp = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const collection = await firestore.db.collection('StateInfo')
      .select('id', 'alloy')
      .where('created', '>', new Date(await readLastTimestamp()))
      .orderBy('created', 'asc')
      .limit(500)
      .get()

    if(collection.size) console.log(`Updating records for ${collection.size} sign ups.`)

    const updates: Array<Partial<RichStateInfo> & { id: string }> = collection.docs.map(entry => {
      const data = entry.data() as RichStateInfo
      return {
        id: entry.id,
        alloy: {
          id: data.alloy?.id ?? null,
          status: data.alloy?.status ?? 'Not Found',
          // If this is undefined we won't be able to do comparison queries
          // of the last 24 hours
          timestamp: data.alloy?.timestamp ?? 0,
        }
      }
    })

    await firestore.batchUpdateRegistrations(updates)

    if (collection.size > 0) { // There's still scanning to do
      // The last item will have the most recent timestamp since we've sorted
      // the query by ascending creation date.
      const lastIndex = collection.size - 1
      await saveLastTimestamp(collection.docs[lastIndex].createTime.toMillis())
      console.log('Update completed. Running next scan.')
    } else {
      console.log('Finished scanning the collection for Alloy timestamp.')
      return
    }
  }
}

// Allow us to run the script locally
if (require.main === module) {
  scanSignupsForAlloyTimestamp()
}
