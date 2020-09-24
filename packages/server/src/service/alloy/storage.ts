import { FirestoreService } from '../firestore'

const firestore = new FirestoreService()

export interface CrossCheckStorageSchema {
  id: 'onlyOne'
  /**
   * When the logic for cross checking registrations happens for the first time
   * we need to perform a full DB scan on `StateInfo`. Because we can't query
   * for things that don't exist at Google Firestore (for example, querying for
   * voters whose alloyStatus.timestamp != undefined) we need to manually query
   * all records from the start to add them to the Queue.
   *
   * As long as we haven't finished enqueueing all records the logic for cross
   * checking registration is considered in the `firstAnalysis` state. At this
   * point, when we find users who haven't yet a definite response from alloy
   * (i.e. those who are still 'Pending', or 'Not Found', etc.) are enqueued
   * to the Queue. When we finish doing the 'firstAnalysis' the cronjob is set
   * to reched the registration only for these users.
   */
  firstAnalysis: boolean
  /**
   * When at the `firstAnalysis` we'll query up to 500 documents per time,
   * going through the oldest documents first.
   *
   * We save the timestamp of the most recent document from this query so
   * we can continue where we left off.
   */
  currentCreatedTime: number
  /**
   * A Record of <VoterId, timestamp> that holds the ids of voters who haven't
   * received a definite status from Alloy yet (e.g. they're still with registration
   * status like 'Pending', 'Not Found', etc.), we'll recheck them in a posterior
   * run.
   *
   * voters that have sign up after these features were implemented are
   * automatically added to this list if they meet the criteria above.
   */
  queue: Record<string, number>
}

export class CrossCheckStorage {
  private synced = false

  private get doc() {
    return firestore.db.collection('CrossCheck').doc('storage')
  }

  private storage: CrossCheckStorageSchema = {
    id: 'onlyOne',
    currentCreatedTime: 0,
    firstAnalysis: true,
    queue: {},
  }

  async initializeOrSync() {
    const get = await this.doc.get()
    const data = get.data()

    if (!data) {
      await this.doc.set(this.storage, { merge: true })
    } else {
      this.storage = {
        ...data as CrossCheckStorageSchema,
      }
    }

    this.synced = true
  }

  get data(): CrossCheckStorageSchema {
    if (!this.synced) throw new Error('Needs to synchronize CrossCheckStorage first')
    return this.storage
  }

  async update(storage: CrossCheckStorageSchema) {
    this.storage = storage

    await this.doc.set(this.storage, { merge: true })
  }
}
