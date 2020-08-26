import { FirestoreService } from '../service/firestore'
import { analyticsLogic } from './logic'

const firestore = new FirestoreService()

// Used to save the document
export interface AnalyticsStorageSchema {
  readonly id: 'onlyOne'
  lastQueryTime: number
  totalSignups: number
  yesterdayDate: number
  yesterdaySignups: number
}

class AnalyticsStorage {
  private synced = false

  private get doc() {
    return firestore.db.collection('Analytics').doc('storage')
  }

  private storage: AnalyticsStorageSchema = {
    id: 'onlyOne',
    lastQueryTime: 0,
    totalSignups: 0,
    yesterdayDate: 0,
    yesterdaySignups: 0,
  }

  /**
   * Refreshes the in-memory values or creates the default document in
   * the collection.
   *
   * If this function is successful, the DB is considered as synchronized
   * for 1 minute.
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

    // We need this timer here since we use `AnalyticsStorage` at all files
    // related to the clouds analytics functions.
    //
    // To avoid adding FirestoreService as a dependency at analytics/logic.ts,
    // analyticsLogic.calculateSignups() takes a snapshot as a parameter, so
    // we would have to call initializeOrSync at both logic.ts and
    // updateTimeSeries.ts
    //
    // The best way to avoid errors (while avoiding multiple calls to initializeOrSync)
    // is to limit the amount of time synced is considered true, since these
    // classes persists until the back-end service is shut down.
    this.synced = true
    setTimeout(() => { this.synced = false }, 60 * 1000)
  }

  get data(): AnalyticsStorageSchema  {
    if (!this.synced) {
      throw('Needs to synchronize AnalyticsStorage first')
    }
    return this.storage
  }

  /** Updates the in-memory and firestore values of the analytics functions */
  update = async (totalSignups: number, yesterdaySignups: number, lastQueryTime: number) => {
    this.storage = {
      id: 'onlyOne',
      yesterdaySignups, totalSignups, lastQueryTime,
      yesterdayDate: analyticsLogic.midnightYesterday.valueOf(),
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

/**
 * Contains functionality that allows us to query and update information
 * about our analytics.
 *
 * Since the operations here required synchronization with our storage,
 * analyticsStorage requires the usage of `initializeOrSync` before any
 * operation in order to be successful.
 */
export const analyticsStorage = new AnalyticsStorage()
