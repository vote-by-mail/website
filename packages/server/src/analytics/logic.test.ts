import { analyticsLogic } from './logic'
import { createMock } from 'ts-auto-mock'
import { AnalyticsStorageSchema } from './storage'

jest.mock('./storage')

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
type SignupMock = { createTime: { seconds: number } }

/**
 * Returns a snapshot that always has the desired amount of yesterday and total signups.
 *
 * @param newSignups Amount of signups that should increment both metrics
 * @param pastSignups The previous amount of signups not including new signups
 * @param lastQueryTime Numeric value of lastQueryTime, if not null the snapshot
 * will only be the same length as newSignups
 */
const snapshot = (
  newSignups: number,
  pastSignups: number,
  lastQueryTime: number | null,
): Snapshot => {
  // The day when the query happened, results in this day should increment
  // the daily metric
  const queryToday = lastQueryTime
    ? new Date(lastQueryTime)
    : analyticsLogic.midnightToday
  // One day before the query happened, these should not increment the
  // daily metric
  const queryYesterday = new Date(
    queryToday.getFullYear(),
    queryToday.getMonth(),
    // Node.js handles 0 as the last day of the previous month without
    // issues
    queryToday.getDate() - 1,
  )

  // When lastQueryTime is provided the service is only going to fetch for
  // new signups.
  // To simulate that behavior here we only return an array with past results
  // (those that do not increment the daily metric) when lastQueryTime is null
  const signups: SignupMock[] = lastQueryTime
    ? [
      // Google timestamps uses seconds instead of ms (default JS stamp)
      // we divide valueOf by 1000 to avoid issues, since logic.ts will expect
      // google timestamps
      ...Array<SignupMock>(newSignups).fill({
        createTime: { seconds: queryToday.valueOf() / 1000 }
      }),
    ]
    : [
      ...Array<SignupMock>(newSignups).fill({
        createTime: { seconds: queryToday.valueOf() / 1000 }
      }),
      ...Array<SignupMock>(pastSignups).fill({
        createTime: { seconds: queryYesterday.valueOf() / 1000 }
      })
    ]

  return createMock<Snapshot>({
    forEach(cb: (el: SignupMock) => void) {
      signups.forEach(cb)
    },
    size: signups.length,
  })
}

test('analyticsLogic initializes firstQuery with right results', () => {
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

  const { todaySignups, totalSignups } = analyticsLogic.calculateSignups(
    storedData,
    snapshot(newSignups, pastSignups, null),
  )

  expect(todaySignups).toBe(newSignups)
  expect(totalSignups).toBe(newSignups + pastSignups)
})

test('analyticsLogic increments stored values correctly', () => {
  const today = analyticsLogic.midnightToday
  // This query happened yesterday, so we can test if it ignores the previous
  // value of todaySignups
  const lastQueryTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 1,
  )
  // Should increment both daily and total signups
  const newSignups = 5
  // Should increment only total signups
  const pastSignups = 10
  const storedTodaySignups = 10

  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    totalSignups: pastSignups,
    lastQueryTime: lastQueryTime.valueOf(),
    todaySignups: storedTodaySignups,
  }

  const { todaySignups, totalSignups } = analyticsLogic.calculateSignups(
    storedData,
    snapshot(newSignups, pastSignups, lastQueryTime.valueOf()),
  )

  expect(totalSignups).toBe(pastSignups + newSignups)
  expect(todaySignups).toBe(newSignups)
})
