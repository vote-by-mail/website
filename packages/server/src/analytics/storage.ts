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
   * the collection
   */
  private initializeOrSync = async () => {
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
  }

  data = async (): Promise<AnalyticsStorageSchema> => {
    await this.initializeOrSync()
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
  isFirstQuery = async (): Promise<boolean> => {
    await this.initializeOrSync()
    return this.storage.lastQueryTime === 0
  }
}

export const analyticsStorage = new AnalyticsStorage()
