import { FirestoreService } from '../service/firestore'
import { ImplementedState, implementedStates } from '../common'

const firestore = new FirestoreService()

export interface AnalyticsMetricPair {
  todaySignups: number
  totalSignups: number
}

// Used to save the document
export interface AnalyticsStorageSchema {
  readonly id: 'onlyOne'
  lastQueryTime: number
  totalSignups: number
  todaySignups: number
  /**
   * Allows us to update instead of create a dashboard when using the script
   * that automatically creates a dashboard
   */
  dashboardPath?: string | null
  state: {
    /**
     * Backward compatibility value so we can use the same storage file
     * for tracking per-state values.
     */
    lastQueryTime: number
    values: Record<ImplementedState, AnalyticsMetricPair>
  }
  org: {
    /**
     * Backward compatibility value so we can use the same storage file
     * for tracking org values.
     */
    lastQueryTime: number
    values: Record<string, AnalyticsMetricPair>
  }
}

export const makeStateStorageRecord = () => {
  return Object.fromEntries(
    implementedStates.map(s => [s, { todaySignups: 0, totalSignups: 0 }])
  ) as Record<ImplementedState, AnalyticsMetricPair>
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
    dashboardPath: null,
    state: {
      lastQueryTime: 0,
      values: makeStateStorageRecord(),
    },
    org: {
      lastQueryTime: 0,
      values: {},
    },
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

      // Backward compatibility layer, on older versions of this script
      // storage.state would be undefined, adding this here in case the
      // spread operator above erases this value
      if (!this.storage.state) {
        this.storage.state = {
          lastQueryTime: 0,
          values: makeStateStorageRecord(),
        }
      }
      if (!this.storage.org) {
        this.storage.org = {
          lastQueryTime: 0,
          values: {},
        }
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
  async update(storage: AnalyticsStorageSchema) {
    this.storage = storage

    await this.doc.set(storage, { merge: true })
  }

  /** Returns true if this storage has no record of previous queries */
  get isFirstQuery(): boolean {
    if (!this.synced) {
      throw('Needs to synchronize AnalyticsStorage first')
    }
    return this.storage.lastQueryTime === 0
  }

  async updateDashboard(dashboardPath: string) {
    this.storage.dashboardPath = dashboardPath
    return this.doc.set(this.storage, { merge: true })
  }
}
