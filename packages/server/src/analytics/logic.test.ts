import { calculateSignups } from './logic'
import { createMock } from 'ts-auto-mock'
import { AnalyticsStorageSchema, makeStateStorageRecord } from './storage'

jest.mock('./storage', () => ({
  AnalyticsStorage() { return function () {/* do nothing */}},
  makeStateStorageRecord: jest.requireActual('./storage').makeStateStorageRecord,
}))

const queriedState = 'Florida'

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
type SignupMock = {
  createTime: { seconds: number }
  get(state: string): 'Florida'
}

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
// 4. calculateSignups works when initializing per-state values for the
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

/** Automates the creation of per-state storage object */
const makeStateStorage = (storedToday: number, storedTotal: number, lastQueryTime: number) => {
  const values = makeStateStorageRecord()

  values[queriedState] = { todaySignups: storedToday, totalSignups: storedTotal }

  return {
    lastQueryTime,
    values,
  }
}

/**
 * Returns a snapshot that always has the desired amount of past and total
 * signups.
 *
 * @param newSignups Amount of signups that should increment both metrics
 * @param storedTodaySignups Should only be present when testing ongoing per-state
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
): Snapshot => {
  const signups: SignupMock[] = [
    // Google timestamps uses seconds instead of ms (default JS stamp) we
    // divide valueOf by 1000 to avoid issues, since logic.ts will expect
    // google timestamps
    ...Array<SignupMock>(newSignups).fill({
      createTime: { seconds: lastQueryTime / 1000 },
      get(_: string) { return queriedState },
    }),
    ...Array<SignupMock>(storedTodaySignups).fill({
      // Should happen a bit before lastQueryTime, so we can test that when
      // initializing per-state values for the first time these won't appear
      // repeatedly at `todaySignups`.
      createTime: { seconds: (lastQueryTime - 20) / 1000 },
      get(_: string) { return queriedState },
    }),
    // Subtracted by storedTodaySignups since these two happened in the past
    ...Array<SignupMock>(pastSignups - storedTodaySignups).fill({
      createTime: { seconds: inThePast.valueOf() / 1000 },
      get(_: string) { return queriedState },
    }),
  ]

  return createMock<Snapshot>({
    forEach(cb: (el: SignupMock) => void) {
      signups.forEach(cb)
    },
    size: signups.length,
  })
}

test('calculateSignups return the right results on first query', () => {
  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: 0,
    lastQueryTime: 0,
    todaySignups: 0,
    state: makeStateStorage(0, 0, 0),
  }

  // Should increment both total and daily signups
  const newSignups = 4
  // Should increment only total signups
  const pastSignups = 10

  const { todaySignups, totalSignups, state } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, pastSignups, todayNight.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(newSignups + pastSignups)
  expect(state.lastQueryTime).toBeTruthy()
  expect(state.values[queriedState].todaySignups).toBe(newSignups)
  expect(state.values[queriedState].totalSignups).toBe(newSignups + pastSignups)
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
    state: makeStateStorage(storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
  }

  const { todaySignups, totalSignups, state } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, 0, todayNight.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(storedDailySignups + newSignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)
  expect(state.values[queriedState].todaySignups).toBe(storedDailySignups + newSignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)
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
    state: makeStateStorage(storedDailySignups, storedTotalSignups, yesterday.valueOf())
  }

  const { todaySignups, totalSignups, state } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, 0, todayNoon.valueOf()),
    todayNoon,
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)
  expect(state.values[queriedState].todaySignups).toBe(newSignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)
})

test('calculateSignups works when initializing perState data with backward compatibility', () => {
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
    state: makeStateStorage(0, 0, 0)
  }

  const { todaySignups, totalSignups, state } = calculateSignups(
    storedData,
    snapshot(newSignups, storedDailySignups, storedTotalSignups, todayNoon.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(newSignups + storedDailySignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)
  expect(state.lastQueryTime).toBeTruthy()
  expect(state.values[queriedState].todaySignups).toBe(newSignups + storedDailySignups)
  expect(state.values[queriedState].totalSignups).toBe(storedTotalSignups + newSignups)
})
