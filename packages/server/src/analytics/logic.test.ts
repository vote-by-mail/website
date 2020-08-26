import { analyticsLogic } from './logic'
import { createMock } from 'ts-auto-mock'
import { AnalyticsStorageSchema } from './storage'

jest.mock('./storage')

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
type SignupMock = { createTime: { seconds: number } }

/**
 * Returns a snapshot that always has the desired amount of yesterday and total signups.
 *
 * @param yesterdayAmount The amount of signups for yesterday (day before lastQueryTime)
 * @param totalAmount The total amount of signups (inlcuding from yesterday)
 * @param lastQueryTime Numeric value of lastQueryTime
 */
const snapshot = (
  yesterdayAmount: number,
  totalAmount: number,
  lastQueryTime: number,
): Snapshot => {
  const queryDateTime = new Date(lastQueryTime)
  const yesterday = !lastQueryTime
    ? analyticsLogic.midnightYesterday
    : new Date(
        queryDateTime.getFullYear(),
        queryDateTime.getMonth(),
        queryDateTime.getDate() -1,
      )
  // Happens two days before the query
  const inThePast = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate() - 1,
  )

  const signups: SignupMock[] = [
    // Google timestamps uses seconds instead of ms (default JS stamp)
    // we divide valueOf by 1000 to avoid issues, since logic.ts will expect
    // google timestamps
    ...Array<SignupMock>(yesterdayAmount).fill({
      createTime: { seconds: yesterday.valueOf() / 1000 }
    }),
    ...Array<SignupMock>(totalAmount - yesterdayAmount).fill({
      createTime: { seconds: inThePast.valueOf() / 1000 }
    })
  ]

  return createMock<Snapshot>({
    forEach(cb: (el: SignupMock) => void) {
      signups.forEach(cb)
    },
    size: signups.length,
  })
}

test('analyticsLogic initializes the firstQuery with right results', () => {
  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    yesterdaySignups: 0,
    yesterdayDate: 0,
    totalSignups: 0,
    lastQueryTime: 0,
  }

  const { yesterdaySignups, totalSignups } = analyticsLogic.calculateSignups(
    storedData,
    snapshot(4, 10, 0),
  )

  expect(yesterdaySignups).toBe(4)
  expect(totalSignups).toBe(10)
})

test('analyticsLogic increments stored values correctly', () => {
  const yesterday = analyticsLogic.midnightYesterday
  const beforeYesterday = new Date(
    yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 2,
  )
  const storedData: AnalyticsStorageSchema = {
    id: 'onlyOne',
    yesterdayDate: beforeYesterday.valueOf(),
    yesterdaySignups: 40, // Should be ignored
    totalSignups: 500, // should be added to the new amount of total signups
    lastQueryTime: yesterday.valueOf(),
  }

  const { yesterdaySignups, totalSignups } = analyticsLogic.calculateSignups(
    storedData,
    snapshot(0, 10, yesterday.valueOf()),
  )

  expect(yesterdaySignups).toBe(10)
  expect(totalSignups).toBe(510) // stored + the total of new snapshot
})
