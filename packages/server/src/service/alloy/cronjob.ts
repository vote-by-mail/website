import FirebaseFirestore from '@google-cloud/firestore'
import { CrossCheckStorage } from './storage'
import { FirestoreService } from '../firestore'
import { NameParts, Address, AlloyStatus, processEnvOrThrow } from '../../common'
import { recheckRegistration, shouldCrossCheck } from './recheck'

export interface CrossCheckStateInfo {
  id: string
  created: FirebaseFirestore.Timestamp
  name: string
  nameParts?: NameParts
  birthdate: string
  address: Address
  alloyStatus?: AlloyStatus
}

const firestore = new FirestoreService()
const alloyRecheckInterval: number = +processEnvOrThrow('ALLOY_RECHECK_INTERVAL')

/**
 * Update a queue record, deletes `null` items from newItems when merging the
 * two.
 */
const updateQueue = (
  oldQueue: Record<string, number>,
  newItems: Record<string, number | null>,
): Record<string, number> => Object.fromEntries(
  Object.entries(
    // We overwrite the stored queue with the values from newItems, note
    // that newItems can have `null` values, we use these to delete items
    // when filtering entries.
    {...oldQueue, ...newItems}
  ).filter(
    d => d[1] !== null
  ) as [string, number][]
)

const recheckDocuments = async (nowTimestamp: number, storage: CrossCheckStorage, documents: CrossCheckStateInfo[]) => {
  if (!documents.length) {
    return
  }

  // This map is updated as we recheck registrations, and if we get a definite
  // answer from alloy (i.e. 'Active', 'Rejected', etc.) we update the entry
  // with `null` so it can be deleted from the queue.
  const newQueueItems: Record<string, number | null> = Object.fromEntries(
    documents.filter(d => shouldCrossCheck(nowTimestamp, d.alloyStatus)).map(d => [d.id, nowTimestamp])
  )

  // This array will be used to batch update registrations
  const updatedRegistrations: Array<Partial<CrossCheckStateInfo> & { id: string }> = []

  for (let i = 0; i < documents.length; i++) {
    // Note that recheckRegistration can return null if there's no need
    // for updates
    const updatedAlloyData = await recheckRegistration(documents[i])
    if (updatedAlloyData) {
      documents[i].alloyStatus = updatedAlloyData
      updatedRegistrations[i] = {
        // Safe to type-cast this since recheckRegistration would've
        // thrown if otherwise
        id: documents[i].id as string,
        alloyStatus: updatedAlloyData,
      }

      // Passing null to ignore the time constraint since we only want
      // to know if the voter has acquired a definite status from alloy or not
      //
      // If we should no longer cross check we remove the voter from newQueueItems
      if (!shouldCrossCheck(null, updatedAlloyData)) {
        newQueueItems[documents[i].id] = null
      }
    }
  }

  // Update registrations in batch
  if (updatedRegistrations.length) {
    await firestore.batchUpdateRegistrations(
      updatedRegistrations.filter(r => !!r) // Removes empty entries
    )
  }

  // Update the cross check storage file
  const queue = updateQueue(storage.data.queue, newQueueItems)
  await storage.update({
    ...storage.data,
    currentCreatedTime: documents[documents.length - 1].created.toMillis(),
    queue,
  })
}

export class CrossCheckLogic {
  // Externally acquired from the constructor so it is already initialized
  private readonly storage: CrossCheckStorage

  /**
   * @param storage A already initialized CrossCheckStorage
   */
  constructor(storage: CrossCheckStorage) {
    // Checks if the storage is already initialized/synced
    try {
      storage.data
    } catch(e) {
      console.error(e)
      throw new Error('CrossCheckLogic needs to have a already initialized CrossCheckStorage')
    }
    this.storage = storage
  }

  /**
   * The initial analysis done when the logic to cross check registrations
   * hasn't finished iterating through the existing sign ups yet in order
   * to enqueue/recheck their statuses.
   */
  async firstAnalysis(nowTimestamp: number) {
    const documents = await firestore.fetchUsersForCrossCheckByCreatedTime(this.storage.data.currentCreatedTime)

    // If we didn't get any new entry to scan then the first analysis is completed.
    if (documents.length === 0) {
      await this.storage.update({...this.storage.data, firstAnalysis: false})
      return
    }

    await recheckDocuments(nowTimestamp, this.storage, documents)
  }

  /**
   * The logic that is used when we've completed the firstAnalysis and we are
   * now only rechecking for registrations in the queue.
   */
  async enqueued(nowTimestamp: number) {
    // Creates a array containing the oldest 500 entries that can be cross-checked
    // right now
    const oldestIdsFromQueue = Object.entries(this.storage.data.queue)
      // Sort by the timestamp in ascending order
      .sort((a, b) => a[1] - b[1])
      .slice(0, 500)
      .filter(entry => nowTimestamp - entry[1] >= alloyRecheckInterval)
      .map(entry => entry[0]) // returns only the IDs

    if (oldestIdsFromQueue.length) {
      const documents = await firestore.fetchUsersForCrossCheckByVotersId(oldestIdsFromQueue)
      await recheckDocuments(nowTimestamp, this.storage, documents)
    }
  }
}

export const crossCheckCronjob = async () => {
  const now = new Date()
  const storage = new CrossCheckStorage()
  await storage.initializeOrSync()
  const logic = new CrossCheckLogic(storage)

  if (!storage.data.firstAnalysis) {
    await logic.firstAnalysis(now.valueOf())
  } else {
    await logic.enqueued(now.valueOf())
  }
}
