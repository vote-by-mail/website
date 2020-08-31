import { AnalyticsStorageSchema } from "./storage"

/**
 * Calculates the new amount of total and daily sign ups.
 *
 * @param queryDateTime The time when this query takes place, ysed to
 * compare if the daily amount of signups should reset or increment.
 */
export const calculateSignups = (
  storage: AnalyticsStorageSchema,
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  queryDateTime: Date,
): { totalSignups: number, todaySignups: number } => {
  const {
    totalSignups: storedTotalSignups,
    todaySignups: storedTodaySignups,
    lastQueryTime
  } = storage

  // Since this metric runs more than once per day we need to check whether
  // the last time it has run was on the same day as queryDateTime. If that's
  // the case we'll reuse the stored todaySignups to increment the next logging
  const incrementDaily = () => {
    const lastQueryTimeDate = new Date(lastQueryTime)
    return queryDateTime.getDate() === lastQueryTimeDate.getDate()
  }

  let todaySignups = incrementDaily() ? storedTodaySignups : 0
  let totalSignups = storedTotalSignups

  // We process this query differently depending if this is the first time
  // these analytics have run or not.
  //
  // When running for the first time, we'll have to manually iterate
  // through the array in order to detect which records happened at queryDateTime.
  //
  // Otherwise we can easily increment todaySignups/totalSignups based
  // on the size of the snapshot.
  if (storage.lastQueryTime === 0) {
    snapshot.forEach(d => {
      // Google timestamps uses seconds instead of ms (default JS stamp)
      // we divide valueOf by 1000 to avoid issues
      if (d.createTime.seconds >= (queryDateTime.valueOf() / 1000)) {
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
