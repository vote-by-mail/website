import { analyticsStorage } from './storage'

class AnalyticsLogic {
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

  calculateSignups(
    snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  ): { totalSignups: number, yesterdaySignups: number } {
    const startTime = this.midnightYesterday
    const { totalSignups: storedTotalSignups } = analyticsStorage.data

    let yesterdaySignups = 0
    let totalSignups = storedTotalSignups

    // We process this query based on the value of analyticsStorage.isFirstQuery
    //
    // If true, we'll have to manually iterate through the array in order to
    // detect which records happened yesterday.
    //
    // Otherwise we can easily increment newYesterdaySignups/newTotalSignups
    // based on the size of the snapshot.
    if (analyticsStorage.isFirstQuery) {
      snapshot.forEach(d => {
        // Google timestamps uses seconds instead of ms (default JS stamp)
        // we divide valueOf by 1000 to avoid issues
        if (d.createTime.seconds >= (startTime.valueOf() / 1000)) {
          yesterdaySignups++
        }
      })
      totalSignups = snapshot.size
    } else {
      yesterdaySignups += snapshot.size
      totalSignups += snapshot.size
    }

    return { totalSignups, yesterdaySignups }
  }
}

export const analyticsLogic = new AnalyticsLogic()
