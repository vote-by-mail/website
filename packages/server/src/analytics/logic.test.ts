import FirebaseFirestore from '@google-cloud/firestore'
import { calculateSignups } from './logic'
import { AnalyticsStorageSchema, makeStateStorageRecord, AnalyticsMetricPair } from './storage'
import { RichStateInfo } from '../service/types'

jest.mock('./storage', () => ({
  AnalyticsStorage() { return function () {/* do nothing */}},
  makeStateStorageRecord: jest.requireActual('./storage').makeStateStorageRecord,
}))

const defaultOrg = 'default'
const queriedState = 'Florida'

// The analytics metrics work by storing and logging the amount of daily
// total sign ups. To ensure we don't lose track of these values, and to
// let us perform incremental queries based on the data collected, we store
// these two + the last time they were queried in a firestore file (storage.ts)
//
// These tests aim to mock the logic behind the work described above, and
// to guarantee the 4 possible cases are working:
//
// 1. calculateSignups works for the first time.
//   We need to test if the system is correctly going to assign the right
//   amount daily and total signups.
//
// 2. calculateSignups works for subsequent queries on the same day
//   We perform multiple queries on the same day, and these should not reset
//   the amount of daily sign ups for the day, just increment them.
//
// 3. calculateSignups works for subsequent queries on different dates
//   The daily amount of sign ups should reset to 0 when lastQueryTime
//   happened on another date than than the current time we're querying
//   for new sign ups.
//
// 4. calculateSignups works when initializing per-state/org values for the
//   first time. In this scenario we must verify that daily/total signups
//   are not incremented repeatedly.

/** The most recent date for mocked tests */
const todayNight = new Date(2020, 7, 31, 22)
/** Used to test if calculateSignups successfully increments todaySignups */
const todayNoon = new Date(2020, 7, 31, 12)
/** Used to test if calculateSignups successfully resets todaySignups to 0 */
const yesterday = new Date(2020, 7, 30)
/** Should never be used as lastQueryTime, used only for checking first time queries */
const inThePast = new Date(2020, 6, 30)

/** Automates the creation of per-state/per-org storages */
const makeSubMetricStorage = <S extends 'state' | 'org'>(
  type: S,
  storedToday: number,
  storedTotal: number,
  lastQueryTime: number,
): AnalyticsStorageSchema[S] => {
  if (type === 'org') {
    const values: Record<string, AnalyticsMetricPair> = {
      [defaultOrg]: { todaySignups: storedToday, totalSignups: storedTotal }
    }
    return {
      lastQueryTime,
      values,
    }
  } else {
    const values = makeStateStorageRecord()

    values[queriedState] = { todaySignups: storedToday, totalSignups: storedTotal }

    return {
      lastQueryTime,
      values,
    }
  }
}

/**
 * Returns a snapshot that always has the desired amount of past and total
 * signups.
 *
 * @param newSignups Amount of signups that should increment both metrics
 * @param storedTodaySignups Should only be present when testing ongoing per-state/org
 * metrics initialization (when the app already has data from previous metrics and is
 * now going to start querying for per-state data). These always happen a bit before
 * lastQueryTime so we can test if initializing per-state sign ups do not repeat
 * these values on todaySignups.
 * @param pastSignups The previous amount of signups not yet in storage,
 * used to test the first time initialization.
 * @param lastQueryTime Numeric value of lastQueryTime.
 */
const snapshot = (
  newSignups: number,
  storedTodaySignups: number,
  pastSignups: number,
  lastQueryTime: number,
) => {
  const signups: Partial<RichStateInfo>[] = [
    // Google timestamps uses seconds instead of ms (default JS stamp) we
    // divide valueOf by 1000 to avoid issues, since logic.ts will expect
    // google timestamps
    ...Array<Partial<RichStateInfo>>(newSignups).fill({
      created: new FirebaseFirestore.Timestamp(lastQueryTime / 1000, 0),
      state: queriedState,
      oid: defaultOrg,
    }),
    ...Array<Partial<RichStateInfo>>(storedTodaySignups).fill({
      // Should happen a bit before lastQueryTime, so we can test that when
      // initializing per-state values for the first time these won't appear
      // repeatedly at `todaySignups`.
      //
      // Using Math.floor since Firebase requires integers
      created: new FirebaseFirestore.Timestamp(Math.floor((lastQueryTime - 20) / 1000), 0),
      state: queriedState,
      oid: defaultOrg,
    }),
    // Subtracted by storedTodaySignups since these two happened in the past
    ...Array<Partial<RichStateInfo>>(pastSignups - storedTodaySignups).fill({
      created: new FirebaseFirestore.Timestamp(inThePast.valueOf() / 1000, 0),
      state: queriedState,
      oid: defaultOrg,
    }),
  ]

  return signups
}

test('calculateSignups return the right results on first query', () => {
  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: 0,
    lastQueryTime: 0,
    todaySignups: 0,
    state: makeSubMetricStorage('state', 0, 0, 0),
    org: makeSubMetricStorage('org', 0, 0, 0),
  }

  // Should increment both total and daily signups
  const newSignups = 4
  // Should increment only total signups
  const pastSignups = 10

  const { todaySignups, totalSignups, state, org } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, pastSignups, todayNight.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(newSignups + pastSignups)

  expect(state.lastQueryTime).toBeTruthy()
  expect(state.values[queriedState].todaySignups).toBe(newSignups)
  expect(state.values[queriedState].totalSignups).toBe(newSignups + pastSignups)

  expect(org.lastQueryTime).toBeTruthy()
  expect(org.values[defaultOrg].todaySignups).toBe(newSignups)
  expect(org.values[defaultOrg].totalSignups).toBe(newSignups + pastSignups)
})

test('calculateSignups increments stored values of the same day correctly', () => {
  // Should increment both daily and total signups
  const newSignups = 5
  const storedDailySignups = 5
  // Should increment only total signups
  const storedTotalSignups = 10

  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: storedTotalSignups,
    lastQueryTime: todayNoon.valueOf(),
    todaySignups: storedDailySignups,
    state: makeSubMetricStorage('state', storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
    org: makeSubMetricStorage('org', storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
  }

  const { todaySignups, totalSignups, state, org } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, 0, todayNight.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(storedDailySignups + newSignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)

  expect(state.values[queriedState].todaySignups).toBe(storedDailySignups + newSignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)

  expect(org.values[defaultOrg].todaySignups).toBe(storedDailySignups + newSignups)
  expect(org.values[defaultOrg].totalSignups).toBe(storedTotalSignups + newSignups)
})

test('calculateSignups increments stored values of different dates correctly', () => {
  // Should increment both daily and total signups
  const newSignups = 5
  // Should be ignored by daily sign ups
  const storedDailySignups = 5
  // Should increment only total signups
  const storedTotalSignups = 10

  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: storedTotalSignups,
    lastQueryTime: yesterday.valueOf(),
    todaySignups: storedDailySignups,
    state: makeSubMetricStorage('state', storedDailySignups, storedTotalSignups, yesterday.valueOf()),
    org: makeSubMetricStorage('org', storedDailySignups, storedTotalSignups, yesterday.valueOf())
  }

  const { todaySignups, totalSignups, state, org } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, 0, todayNoon.valueOf()),
    todayNoon,
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)

  expect(state.values[queriedState].todaySignups).toBe(newSignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)

  expect(org.values[defaultOrg].todaySignups).toBe(newSignups)
  expect(org.values[defaultOrg].totalSignups).toBe(storedTotalSignups + newSignups)
})

test('calculateSignups works when initializing perState data after the script was already running', () => {
  // Should increment both daily and total signups
  const newSignups = 5
  const storedDailySignups = 5
  // Should increment only total signups
  const storedTotalSignups = 10

  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: storedTotalSignups,
    lastQueryTime: todayNoon.valueOf(),
    todaySignups: storedDailySignups,
    state: makeSubMetricStorage('state', 0, 0, 0),
    // per-org data was already initialized in this test
    org: makeSubMetricStorage('org', storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
  }

  const { todaySignups, totalSignups, state, org } = calculateSignups(
    storedData,
    snapshot(newSignups, storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(newSignups + storedDailySignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)

  expect(state.lastQueryTime).toBeTruthy()
  expect(state.values[queriedState].todaySignups).toBe(newSignups + storedDailySignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)

  expect(org.lastQueryTime).toBeTruthy()
  expect(org.values[defaultOrg].todaySignups).toBe(newSignups + storedDailySignups)
  expect(org.values[defaultOrg].totalSignups).toBe(storedTotalSignups + newSignups)
})

test('calculateSignups works when initializing perOrg data after the script was already running', () => {
  // Should increment both daily and total signups
  const newSignups = 5
  const storedDailySignups = 5
  // Should increment only total signups
  const storedTotalSignups = 10

  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: storedTotalSignups,
    lastQueryTime: todayNoon.valueOf(),
    todaySignups: storedDailySignups,
    // per-state data was already initialized in this test
    state: makeSubMetricStorage('state', storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
    org: makeSubMetricStorage('org', 0, 0, 0),
  }

  const { todaySignups, totalSignups, state, org } = calculateSignups(
    storedData,
    snapshot(newSignups, storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(newSignups + storedDailySignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)

  expect(state.lastQueryTime).toBeTruthy()
  expect(state.values[queriedState].todaySignups).toBe(newSignups + storedDailySignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)

  expect(org.lastQueryTime).toBeTruthy()
  expect(org.values[defaultOrg].todaySignups).toBe(newSignups + storedDailySignups)
  expect(org.values[defaultOrg].totalSignups).toBe(storedTotalSignups + newSignups)
})
