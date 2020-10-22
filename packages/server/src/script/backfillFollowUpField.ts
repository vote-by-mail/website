// The functionality implemented in this file allows us to scan sign ups
// until we have populated our collection with the data that allow us to
// send follow up emails to voters who have signed up using our tool.
import { FirestoreService } from '../service/firestore'
import { RichStateInfo } from '../service/types'
import { promises as fs } from 'fs'

const firestore = new FirestoreService()
const timestampName = `${__dirname}/data/followUpScanTimestamp`
const readLastTimestamp = async (): Promise<number> => {
  try {
    const file = await fs.readFile(timestampName, 'utf-8')
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
  await fs.writeFile(timestampName, `${timestamp}`, { encoding: 'utf-8' })
}

/**
 * Queries all records in the DB, modifying the follow up status of each
 * user by adding a zero-ed `sent` timestamp. We do this because we didn't
 * always have this field in the past, and this field allow us to check when
 * the follow up was sent--as well as identify which users still need to receive
 * a follow up email.
 */
export const backfillFollowUpField = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const collection = await firestore.db.collection('StateInfo')
      .select('id', 'followUp', 'state')
      .where('created', '>', new Date(await readLastTimestamp()))
      .orderBy('created', 'asc')
      .limit(500)
      .get()

    if(collection.size) console.log(`Updating records for ${collection.size} sign ups.`)

    const updates = collection.docs.map(entry => {
      const data = entry.data() as RichStateInfo
      if (entry.id) {
        return {
          id: entry.id,
          followUp: { sent: data.followUp?.sent ?? 0 },
        }
      }
      return null
    }).filter(u => !!u) as Array<Partial<RichStateInfo> & { id: string }>

    await firestore.batchUpdateRegistrations(updates)

    if (collection.size > 0) { // There's still scanning to do
      // The last item will have the most recent timestamp since we've sorted
      // the query by ascending creation date.
      const lastIndex = collection.size - 1
      await saveLastTimestamp(collection.docs[lastIndex].createTime.toMillis())
      console.log(`Update completed for ${collection.size} sign ups. Running next scan.`)
    } else {
      console.log('Finished scanning the collection for Follow up emails.')
      return
    }
  }
}

if (require.main === module) {
  backfillFollowUpField()
}
