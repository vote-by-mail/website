import { AnalyticsStorageSchema } from "./storage"

class AnalyticsLogic {
  /** Returns a date set to 00:00 of today */
  get midnightToday() {
    const now = new Date()
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
  }

  calculateSignups(
    storage: AnalyticsStorageSchema,
    snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  ): { totalSignups: number, todaySignups: number } {
    const today = this.midnightToday
    const {
      totalSignups: storedTotalSignups,
      todaySignups: storedTodaySignups,
      lastQueryTime
    } = storage

    // Since this metric runs more than once per day we need to check wheter
    // the last time it has run was on the same day as today. If that's the
    // case we'll reuse the stored todaySignups to increment the next logging
    const incrementDaily = () => {
      const lastQueryTimeDate = new Date(lastQueryTime)
      return today.getDate() === lastQueryTimeDate.getDate()
    }

    let todaySignups = incrementDaily() ? storedTodaySignups : 0
    let totalSignups = storedTotalSignups

    // We process this query differently depending if this is the first time
    // these analytics have run or not.
    //
    // When running for the first time, we'll have to manually iterate
    // through the array in order to detect which records happened today.
    //
    // Otherwise we can easily increment todaySignups/totalSignups based
    // on the size of the snapshot.
    if (storage.lastQueryTime === 0) {
      snapshot.forEach(d => {
        // Google timestamps uses seconds instead of ms (default JS stamp)
        // we divide valueOf by 1000 to avoid issues
        if (d.createTime.seconds >= (today.valueOf() / 1000)) {
          todaySignups++
        }
      })
      totalSignups = snapshot.size
    } else {
      todaySignups += snapshot.size
      totalSignups += snapshot.size
    }

    return { totalSignups, todaySignups }
  }
}

export const analyticsLogic = new AnalyticsLogic()
