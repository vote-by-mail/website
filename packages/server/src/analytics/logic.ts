import { AnalyticsStorageSchema, AnalyticsMetricPair } from "./storage"
import { RichStateInfo } from "../service/types"

const notRepeated = (entryTimeMillis: number, lastQueryTimeMillis: number) => {
  return entryTimeMillis >= lastQueryTimeMillis
}

const incrementMetricPair = <S extends Record<string, AnalyticsMetricPair>>(
  values: S,
  key: keyof S,
  increment: 'both' | 'total',
) => {
  if (!values[key]) {
    // Strangely, we need this as S[keyof S] typecast here or eslint will complain
    // (setting key as string will not resolve this issue too)
    values[key] = { todaySignups: 0, totalSignups: 0 } as S[keyof S]
  }

  if (increment === 'both') {
    if (values[key].todaySignups) values[key].todaySignups += 1
    else values[key].todaySignups = 1
  }
  if (values[key].totalSignups) values[key].totalSignups += 1
  else values[key].totalSignups = 1
}

const getMillis = (e: Partial<RichStateInfo>) => e?.created?.toMillis() ?? 0

/**
 * Automates creating a record of <string, AnalyticsMetricPair> that automatically
 * resets todaySignups to 0 when needed.
 */
const makeAnalyticsPairForRecord = <S extends Record<string, AnalyticsMetricPair>>(
  values: S,
  resetTodaySignups: boolean,
) => {
  // In JS copying objects will just create a reference, we'll use JSON's
  // stringify/parse to manually create a copy of the given values that
  // doesn't affect the original object.
  const valuesDeepCopy = JSON.parse(JSON.stringify(values)) as S

  if (resetTodaySignups) {
    for (const key of Object.keys(values)) {
      if (valuesDeepCopy[key]) {
        valuesDeepCopy[key].todaySignups = 0
      }
    }
  }

  return valuesDeepCopy
}

/**
 * Calculates the new amount of total and daily sign ups.
 *
 * @param queryDateTime The time when this query takes place, ysed to
 * compare if the daily amount of signups should reset or increment.
 */
export const calculateSignups = (
  storage: AnalyticsStorageSchema,
  snapshot: Partial<RichStateInfo>[],
  queryDateTime: Date,
): AnalyticsStorageSchema => {
  const {
    totalSignups: storedTotalSignups,
    todaySignups: storedTodaySignups,
    state: storedState,
    org: storedOrg,
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

  const state = {
    lastQueryTime: storedState.lastQueryTime,
    values: makeAnalyticsPairForRecord(storedState.values, !incrementDaily()),
  }
  const { lastQueryTime: stateLastQueryTime } = state

  const org = {
    lastQueryTime: storedOrg.lastQueryTime,
    values: makeAnalyticsPairForRecord(storedOrg.values, !incrementDaily()),
  }
  const { lastQueryTime: orgLastQueryTime } = org

  // There are two possible cases where we fetch for all entries in our DB.
  //
  // The first when this script is run for the first time, in this case we
  // simply calculate the values based of whether they happened today or not.
  //
  // The second case is more complicated, it happens when we have never queried
  // for per-state/org signups (but have already queried something before). This scenario
  // didn't always exist, and to keep backward compatibility with the previous version
  // of this script we query all entries again but pay attention to not commit repeated values.
  //
  // To avoid incrementing repeated entries when looping from the beginning,
  // we always check for the respective `lastQueryTime`
  const firstQuery = !storage.lastQueryTime || !stateLastQueryTime || !orgLastQueryTime
  const todayMidnight = new Date(
    queryDateTime.getFullYear(),
    queryDateTime.getMonth(),
    queryDateTime.getDate(),
  )

  if (firstQuery) {
    snapshot.forEach(entry => {
      if (entry.state && entry.oid) {
        // Since there are two cases where this loop might happen, we want
        // to make sure it is not querying repeated data (for total/today signups)
        const notRepeatedGlobal = notRepeated(getMillis(entry), lastQueryTime)
        const notRepeatedState = notRepeated(getMillis(entry), stateLastQueryTime)
        const notRepeatedOrg = notRepeated(getMillis(entry), orgLastQueryTime)

        if (getMillis(entry) >= todayMidnight.valueOf()) {
          // Entry happened today, increment both total and today
          if (notRepeatedState) incrementMetricPair(state.values, entry.state, 'both')
          if (notRepeatedOrg) incrementMetricPair(org.values, entry.oid, 'both')
          if (notRepeatedGlobal) {
            totalSignups += 1
            todaySignups += 1
          }
        } else {
          // Only increment total sign ups since the entry is from another day
          if (notRepeatedState) incrementMetricPair(state.values, entry.state, 'total')
          if (notRepeatedOrg) incrementMetricPair(org.values, entry.oid, 'total')
          if (notRepeatedGlobal) totalSignups += 1
        }
      }
    })
  } else {
    snapshot.forEach(entry => {
      if (entry.state && entry.oid) {
        const notRepeatedGlobal = notRepeated(getMillis(entry), lastQueryTime)
        const notRepeatedState = notRepeated(getMillis(entry), stateLastQueryTime)
        const notRepeatedOrg = notRepeated(getMillis(entry), orgLastQueryTime)

        if (notRepeatedState) incrementMetricPair(state.values, entry.state, 'both')
        if (notRepeatedOrg) incrementMetricPair(org.values, entry.oid, 'both')
        if (notRepeatedGlobal) {
          totalSignups += 1
          todaySignups += 1
        }
      }
    })
  }

  const newLastQueryTime = queryDateTime.valueOf()
  state.lastQueryTime = newLastQueryTime
  org.lastQueryTime = newLastQueryTime

  return {
    id: 'onlyOne',
    lastQueryTime: newLastQueryTime,
    totalSignups,
    todaySignups,
    state,
    org,
  }
}
