import { analyticsStorage } from './storage'
import { mocked } from 'ts-jest/utils'
import { analyticsLogic } from './logic'
import { createMock } from 'ts-auto-mock'

jest.mock('./storage')

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
type SignupMock = { createTime: { seconds: number } }

// Returns a snapshot that always has 40 yesterday signups and 500 total signups.
const snapshot = (lastQueryTime: number): Snapshot => {
  const queryDateTime = new Date(lastQueryTime)
  const yesterdayDate = lastQueryTime === 0
  ? analyticsLogic.midnightYesterday
  : new Date(
      queryDateTime.getFullYear(),
      queryDateTime.getMonth(),
      queryDateTime.getDate() -1,
    )
  const signups: SignupMock[] = []

  for (let i = 0; i < 500; i++) {
    if (i < 40) {
      signups.push({ createTime: { seconds: yesterdayDate.valueOf() } })
    } else {
      signups.push({ createTime: { seconds: lastQueryTime } })
    }
  }

  return createMock<Snapshot>({
    forEach(cb: (el: SignupMock) => void) {
      signups.forEach(cb)
    },
    size: signups.length,
  })
}

test('analyticsLogic initializes the firstQuery with right results', async () => {
  mocked(analyticsStorage, true).isFirstQuery = jest.fn().mockResolvedValue(true)
  const data = mocked(analyticsStorage, true).data = jest.fn().mockResolvedValue({
    yesterdaySignups: 0,
    yesterdayDate: 0,
    totalSignups: 0,
    lastQueryTime: 0,
  })

  const { yesterdaySignups, totalSignups } = await analyticsLogic.calculateSignups(
    snapshot(0),
  )

  expect(yesterdaySignups).toBe(40)
  expect(totalSignups).toBe(500)
  expect(data).toHaveBeenCalledTimes(1)
})

test('analyticsLogic increments stored values correctly', async () => {
  const yesterday = analyticsLogic.midnightYesterday
  const beforeYesterday = new Date(
    yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 2,
  )
  mocked(analyticsStorage, true).isFirstQuery = jest.fn().mockResolvedValue(false)
  const data = mocked(analyticsStorage, true).data = jest.fn().mockResolvedValue({
    yesterdaySignups: 40,
    yesterdayDate: beforeYesterday.valueOf(),
    totalSignups: 500,
    lastQueryTime: yesterday.valueOf(),
  })

  const { yesterdaySignups, totalSignups } = await analyticsLogic.calculateSignups(
    snapshot(yesterday.valueOf()),
  )

  // When the query is run after the first time we assign yesterdaySignup
  // to the size of the snapshot (since it's expected that these will run daily).
  // which is why we expect this yesterdaySignup to be 500 and not 460
  expect(yesterdaySignups).toBe(500)
  expect(totalSignups).toBe(1000)
  expect(data).toHaveBeenCalledTimes(1)
})
