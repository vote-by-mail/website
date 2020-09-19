import { AnalyticsStorageSchema, makeStateStorageRecord } from "./storage"
import { getImplementedState } from "../common"

interface CalculatedSignups {
  totalSignups: number
  todaySignups: number
  state: AnalyticsStorageSchema['state']
}

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
): CalculatedSignups => {
  const {
    totalSignups: storedTotalSignups,
    todaySignups: storedTodaySignups,
    state: storedState,
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
  const state: CalculatedSignups['state'] = {
    lastQueryTime: storedState.lastQueryTime,
    totalSignups: {...storedState.totalSignups},
    // Like we did for todaySignups, we need to check whether to increment
    // todaySignups on a per-state basis or to reset the counter if needed.
    todaySignups: incrementDaily()
      ? {...storedState.todaySignups}
      : makeStateStorageRecord(),
  }
  const { lastQueryTime: stateLastQueryTime } = state

  // There are two possible cases where we fetch for all entries in our DB.
  //
  // The first when this script is run for the first time, in this case we
  // simply calculate the values based of whether they happened today or not.
  //
  // The second case is more complicated, it happens when we have never queried
  // for per-state-signups (but have already queried something before). This scenario
  // didn't always exist, and to keep backward compatibility with the previous version
  // of this script we query all entries again but pay attention to repeated values.
  //
  // To avoid incrementing repeated entries when looping from the beginning,
  // we always check for the respective `lastQueryTime`
  const loopingFromTheStart = !storage.lastQueryTime || !stateLastQueryTime
  const todayMidnight = new Date(
    queryDateTime.getFullYear(),
    queryDateTime.getMonth(),
    queryDateTime.getDate(),
  )

  if (loopingFromTheStart) {
    snapshot.forEach(entry => {
      const entryState = getImplementedState(entry.get('address.state') ?? '')
      // Since there are two cases where this loop might happen, we want
      // to make sure it is not querying repeated data (for total/today signups)
      const notRepeated = entry.createTime.seconds >= (lastQueryTime / 1000)

      // Google timestamps uses seconds instead of ms (default JS stamp)
      // we divide valueOf by 1000 to avoid issues
      if (entry.createTime.seconds >= (todayMidnight.valueOf() / 1000)) {
        if (notRepeated) {
          totalSignups += 1
          todaySignups += 1
        }
        if (entryState) {
          state.totalSignups[entryState] += 1
          state.todaySignups[entryState] += 1
        }
      } else {
        if (notRepeated) totalSignups += 1
        if (entryState) state.totalSignups[entryState] += 1
      }
    })
  } else {
    snapshot.forEach(entry => {
      const entryState = getImplementedState(entry.get('address.state'))
      totalSignups += 1
      todaySignups += 1
      if (entryState) {
        state.todaySignups[entryState] += 1
        state.totalSignups[entryState] += 1
      }
    })
  }

  state.lastQueryTime = queryDateTime.valueOf()

  return { totalSignups, todaySignups, state }
}
