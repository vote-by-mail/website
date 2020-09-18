import { AnalyticsStorageSchema, makeStateStorageRecord } from "./storage"
import { getState, isImplementedState } from "../common"

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
    state: storedPerState,
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
  const perState: CalculatedSignups['state'] = {
    queriedStatesBefore: storedPerState.queriedStatesBefore,
    totalSignups: {...storedPerState.totalSignups},
    // Like we did for todaySignups, we need to check whether to increment
    // todaySignups on a perState basis or to reset the counter if needed.
    todaySignups: incrementDaily()
      ? {...storedPerState.todaySignups}
      : makeStateStorageRecord(),
  }
  const { queriedStatesBefore } = perState

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
  // Repeated values can happen if we ignore the fact that this script runs more
  // than once per day, when not incrementing per-state values we should always
  // compare if entries have happened after `lastQueryTime`
  const loopingFromTheStart = storage.lastQueryTime === 0 || !queriedStatesBefore
  const todayMidnight = new Date(
    queryDateTime.getFullYear(),
    queryDateTime.getMonth(),
    queryDateTime.getDate(),
  )

  const getImplementedState = (str: string) => {
    const state = getState(str)
    if (!state) return null
    if (isImplementedState(state)) return state
    return null
  }

  if (loopingFromTheStart) {
    snapshot.forEach(d => {
      const state = getImplementedState(d.get('address.state'))
      // Since there are two cases where this loop might happen, we want
      // to make sure it is not querying repeated data (for total/today signups)
      const notRepeated = d.createTime.seconds >= (lastQueryTime / 1000)

      // Google timestamps uses seconds instead of ms (default JS stamp)
      // we divide valueOf by 1000 to avoid issues
      if (d.createTime.seconds >= (todayMidnight.valueOf() / 1000)) {
        if (notRepeated) {
          totalSignups += 1
          todaySignups += 1
        }
        if (state) {
          perState.totalSignups[state] += 1
          perState.todaySignups[state] += 1
        }
      } else {
        if (notRepeated) totalSignups += 1
        if (state) perState.totalSignups[state] += 1
      }
    })
  } else {
    snapshot.forEach(d => {
      const state = getImplementedState(d.get('address.state'))
      totalSignups += 1
      todaySignups += 1
      if (state) {
        perState.todaySignups[state] += 1
        perState.totalSignups[state] += 1
      }
    })
  }

  // Tells storage that we've now queried for per-state information
  perState.queriedStatesBefore = true

  return { totalSignups, todaySignups, state: perState }
}
