import { analyticsStorage } from './storage'
import { mocked } from 'ts-jest/utils'
import { analyticsLogic } from './logic'
import { createMock } from 'ts-auto-mock'

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
  const yesterday = lastQueryTime === 0
  ? analyticsLogic.midnightYesterday
  : new Date(
      queryDateTime.getFullYear(),
      queryDateTime.getMonth(),
      queryDateTime.getDate() -1,
    )
  // Happens at the last day of the previous month from yesterday date
  const inThePast = new Date(yesterday.getFullYear(), yesterday.getMonth(), -1)

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

test('analyticsLogic initializes the firstQuery with right results', async () => {
  mocked(analyticsStorage, true).isFirstQuery = true
  mocked(analyticsStorage, true).data = {
    id: 'onlyOne',
    yesterdaySignups: 0,
    yesterdayDate: 0,
    totalSignups: 0,
    lastQueryTime: 0,
  }

  const { yesterdaySignups, totalSignups } = await analyticsLogic.calculateSignups(
    snapshot(4, 10, 0),
  )

  expect(yesterdaySignups).toBe(4)
  expect(totalSignups).toBe(10)
})

test('analyticsLogic increments stored values correctly', async () => {
  const yesterday = analyticsLogic.midnightYesterday
  const beforeYesterday = new Date(
    yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 2,
  )
  mocked(analyticsStorage, true).isFirstQuery = false
  const storedYesterday = 40 // Should be ignored
  const storedTotal = 500 // should be added to the new amount of total signups
  mocked(analyticsStorage, true).data = {
    id: 'onlyOne',
    yesterdaySignups: storedYesterday,
    yesterdayDate: beforeYesterday.valueOf(),
    totalSignups: storedTotal,
    lastQueryTime: yesterday.valueOf(),
  }

  const { yesterdaySignups, totalSignups } = await analyticsLogic.calculateSignups(
    snapshot(4, 10, yesterday.valueOf()),
  )

  // When the query is run after the first time we assign yesterdaySignup
  // to the size of the snapshot (since it's expected that these will run daily).
  // which is why we expect this yesterdaySignup to be 10 and not 6
  expect(yesterdaySignups).toBe(10)
  expect(totalSignups).toBe(510) // stored + the total of new snapshot
})
