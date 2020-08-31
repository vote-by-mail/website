import { calculateSignups } from './logic'
import { createMock } from 'ts-auto-mock'
import { AnalyticsStorageSchema } from './storage'

jest.mock('./storage')

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
type SignupMock = { createTime: { seconds: number } }

// The analytics metrics work by storing and logging the amount of daily
// total sign ups. To ensure we don't lose track of these values, and to
// let us perform incremental queries based on the data collected, we store
// these two + the last time they were queried in a firestore file (storage.ts)
//
// These tests aim to mock the logic behind the work described above, and
// to guarantee the 3 possible cases are working:
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

/** The most recent date for mocked tests */
const todayNight = new Date(2020, 7, 31, 22)
/** Used to test if calculateSignups successfully increments todaySignups */
const todayNoon = new Date(2020, 7, 31, 12)
/** Used to test if calculateSignups successfully resets todaySignups to 0 */
const yesterday = new Date(2020, 7, 30)
/** Should never be used as lastQueryTime, used only for checking first time queries */
const inThePast = new Date(2020, 6, 30)

/**
 * Returns a snapshot that always has the desired amount of past and total
 * signups.
 *
 * @param newSignups Amount of signups that should increment both metrics
 * @param pastSignups The previous amount of signups not yet in storage,
 * used to test the first time initialization.
 * @param lastQueryTime Numeric value of lastQueryTime.
 */
const snapshot = (
  newSignups: number,
  pastSignups: number,
  lastQueryTime: number,
): Snapshot => {
  const signups: SignupMock[] = [
    // Google timestamps uses seconds instead of ms (default JS stamp) we
    // divide valueOf by 1000 to avoid issues, since logic.ts will expect
    // google timestamps
    ...Array<SignupMock>(newSignups).fill({
      createTime: { seconds: lastQueryTime / 1000 }
    }),
    ...Array<SignupMock>(pastSignups).fill({
      createTime: { seconds: inThePast.valueOf() / 1000 }
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
  }

  // Should increment both total and daily signups
  const newSignups = 4
  // Should increment only total signups
  const pastSignups = 10

  const { todaySignups, totalSignups } = calculateSignups(
    storedData,
    snapshot(newSignups, pastSignups, todayNight.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(newSignups + pastSignups)
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
  }

  const { todaySignups, totalSignups } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, todayNight.valueOf()),
    todayNight,
  )

  expect(todaySignups).toBe(storedDailySignups + newSignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)
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
  }

  const { todaySignups, totalSignups } = calculateSignups(
    storedData,
    snapshot(newSignups, 0, todayNoon.valueOf()),
    todayNoon,
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(storedTotalSignups + newSignups)
})
