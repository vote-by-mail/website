import { FirestoreService } from '../service/firestore'

const firestore = new FirestoreService()

// Used to save the document
interface RawStorage {
  id: 'onlyOne'
  lastQueryTime: number
  totalSignups: number
  yesterdayDate: number
  yesterdaySignups: number
}

// Used to speed up coding, since timestamps are already converted to Dates
interface Storage {
  lastQueryTime: Date
  totalSignups: number
  yesterdayDate: Date
  yesterdaySignups: number
}

class AnalyticsStorage {
  private get doc() {
    return firestore.db.collection('Analytics').doc('storage')
  }

  private storage: RawStorage = {
    id: 'onlyOne',
    lastQueryTime: 0,
    totalSignups: 0,
    yesterdayDate: 0,
    yesterdaySignups: 0,
  }

  constructor() {
    this.refresh()
  }

  /**
   * Refreshes the in-memory values or creates the default document in
   * the collection
   */
  private refresh = async () => {
    const get = await this.doc.get()
    const data = get.data()

    if (!data) {
      await this.doc.set(this.storage, { merge: true })
    } else {
      this.storage = {
        ...data as RawStorage,
        id: 'onlyOne',
      }
    }
  }

  /**
   * If the stored yesterday date is different than the current one, yesterdaySignups
   * is automatically zeroed to avoid wrong values when updating the daily
   * signup metric
   */
  data = async (): Promise<Storage> => {
    await this.refresh()
    const yesterdayDate = new Date(this.storage.yesterdayDate)
    const yesterdaySignups = yesterdayDate.valueOf() === this.midnightYesterday.valueOf()
      ? this.storage.yesterdaySignups
      : 0
    return {
      yesterdayDate, yesterdaySignups,
      lastQueryTime: new Date(this.storage.lastQueryTime),
      totalSignups: this.storage.totalSignups,
    }
  }

  /** Updates the in-memory and firestore values of the analytics functions */
  update = async (totalSignups: number, yesterdaySignups: number, lastQueryTime: Date) => {
    this.storage = {
      id: 'onlyOne',
      yesterdaySignups, totalSignups,
      lastQueryTime: lastQueryTime.valueOf(),
      yesterdayDate: this.midnightYesterday.valueOf(),
    }

    await this.doc.set(this.storage, { merge: true })
  }

  /** Returns a date set to 00:00 of the previous day */
  get midnightYesterday() {
    const now = new Date()
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      // Node.js handles 0 as the last day of the previous month without
      // issues.
      now.getDate() - 1,
    )
  }

  /** Returns true if this storage has no record of previous queries */
  isFirstQuery = async (): Promise<boolean> => {
    await this.refresh()
    return this.storage.lastQueryTime === 0
  }
}

export const analyticsStorage = new AnalyticsStorage()
