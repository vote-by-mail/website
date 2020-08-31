import { FirestoreService } from '../service/firestore'

const firestore = new FirestoreService()

// Used to save the document
export interface AnalyticsStorageSchema {
  readonly id: 'onlyOne'
  lastQueryTime: number
  totalSignups: number
  todaySignups: number
}

/**
 * Contains functionality that allows us to query and update information
 * about our analytics.
 *
 * Since the operations here required synchronization with our storage,
 * analyticsStorage requires the usage of `initializeOrSync` before any
 * operation in order to be successful.
 */
export class AnalyticsStorage {
  private synced = false

  private get doc() {
    return firestore.db.collection('Analytics').doc('storage')
  }

  private storage: AnalyticsStorageSchema = {
    id: 'onlyOne',
    lastQueryTime: 0,
    totalSignups: 0,
    todaySignups: 0,
  }

  /**
   * Refreshes the in-memory values or creates the default document in
   * the collection.
   */
  initializeOrSync = async () => {
    const get = await this.doc.get()
    const data = get.data()

    if (!data) {
      await this.doc.set(this.storage, { merge: true })
    } else {
      this.storage = {
        ...data as AnalyticsStorageSchema,
        id: 'onlyOne',
      }
    }

    this.synced = true
  }

  get data(): AnalyticsStorageSchema  {
    if (!this.synced) {
      throw('Needs to synchronize AnalyticsStorage first')
    }
    return this.storage
  }

  /** Updates the in-memory and firestore values of analytics functions */
  async update(totalSignups: number, todaySignups: number, lastQueryTime: number) {
    this.storage = {
      id: 'onlyOne',
      totalSignups,
      lastQueryTime,
      todaySignups,
    }

    await this.doc.set(this.storage, { merge: true })
  }

  /** Returns true if this storage has no record of previous queries */
  get isFirstQuery(): boolean {
    if (!this.synced) {
      throw('Needs to synchronize AnalyticsStorage first')
    }
    return this.storage.lastQueryTime === 0
  }
}