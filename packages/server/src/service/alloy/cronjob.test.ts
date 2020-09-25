import FirebaseFirestore from '@google-cloud/firestore'
import { createMock } from 'ts-auto-mock'
import { CrossCheckStorage } from '.'
import { CrossCheckLogic } from './cronjob'
import { AlloyStatus } from '../../common'
import { CrossCheckStorageSchema } from './storage'
import { mocked } from 'ts-jest/utils'
import * as recheck from './recheck'

const testDateTime = new Date(2020, 8, 24)
const entriesDateTime = new Date(2020, 8, 22)

// Note that in these tests when performing alloy requests 'Pending' voters
// become 'Active' and in the same fashion 'Not Found' become 'Pending'.
//
// In other words, 'Active' should not affect the queue, 'Pending' will leave
// the queue and 'Not Found' will be enqueued.

// For these tests voters will have their registration status based on their
// document id
const mockStateInfoCollection = async (
  activeVoters: number,
  pendingVoters: number,
  notFoundVoters: number,
) => {
  const active = Array(activeVoters).fill(null).map((_, idx) => ({
    id: `active${idx}`,
    created: FirebaseFirestore.Timestamp.fromMillis(entriesDateTime.valueOf()),
    alloyStatus: { id: `active${idx}`, timestamp: entriesDateTime.valueOf() },
  }))
  const pending = Array(pendingVoters).fill(null).map((_, idx) => ({
    id: `pending${idx}`,
    created: FirebaseFirestore.Timestamp.fromMillis(entriesDateTime.valueOf()),
    alloyStatus: { id: `pending${idx}`, timestamp: entriesDateTime.valueOf() },
  }))
  const notFound = Array(notFoundVoters).fill(null).map((_, idx) => ({
    id: `notFound${idx}`,
    created: FirebaseFirestore.Timestamp.fromMillis(entriesDateTime.valueOf()),
    alloyStatus: { id: `notFound${idx}`, timestamp: entriesDateTime.valueOf() },
  }))

  return new Promise(r => r([...active, ...pending, ...notFound]))
}

const mockRecheckRegistrations = () => mocked(recheck, true).recheckRegistration = jest.fn().mockImplementation((info) => {
  if (info.id && info?.id?.indexOf('active') >= 0) {
    return new Promise<AlloyStatus>(r => r({
      id: info.id,
      status: 'Active',
    }))
  }
  // Turns pending into active (removes them from queue)
  if (info.id && info?.id?.indexOf('pending') >= 0) {
    return new Promise<AlloyStatus>(r => r({
      id: info.id,
      status: 'Active',
    }))
  }
  // Turns any other status into pending (adds them to the queue)
  return new Promise<AlloyStatus>(r => r({
    id: info.id,
    status: 'Pending',
  }))
})

jest.mock('../firestore', () => {
  const FirestoreService = jest.fn().mockImplementation(() => ({
    batchUpdateRegistrations() { return new Promise(r => r()) },
    fetchUsersForCrossCheckByCreatedTime() {
      return mockStateInfoCollection(2, 4, 4)
    },
    fetchUsersForCrossCheckByVotersId(ids: string[]) {
      const activeVoters = ids.filter(e => e.indexOf('active') >= 0).length
      const pendingVoters = ids.filter(e => e.indexOf('pending') >= 0).length
      const notFoundVoters = ids.filter(e => e.indexOf('notFound') >= 0).length

      return mockStateInfoCollection(activeVoters, pendingVoters, notFoundVoters)
    },
  }))

  return { FirestoreService }
})

const mockQueue = (
  activeVoters: number,
  pendingVoters: number,
  notFoundVoters: number,
) => {
  const active = Array(activeVoters).fill(null).map((_, idx) => [`active${idx}`, entriesDateTime.valueOf()])
  const pending = Array(pendingVoters).fill(null).map((_, idx) => [`pending${idx}`, entriesDateTime.valueOf()])
  const notFound = Array(notFoundVoters).fill(null).map((_, idx) => [`notFound${idx}`, entriesDateTime.valueOf()])
  return Object.fromEntries([...active, ...pending, ...notFound])
}

const mockStorage = (
  currentCreatedTime: number,
  firstAnalysis: boolean,
  queue: Record<string, number>,
) => createMock<CrossCheckStorage>({
  data: {
    id: 'onlyOne',
    currentCreatedTime,
    firstAnalysis,
    queue,
  },
  initializeOrSync: async () => null,
  update(_: CrossCheckStorageSchema) {/* Nothing (will be spied on) */},
})

test('CrossCheckLogic works on the first analysis', async () => {
  const storage = mockStorage(entriesDateTime.valueOf(), true, {})
  const spyOnStorage = spyOn(storage, 'update')
  const mockedRecheck = mockRecheckRegistrations()
  // There should be no items in the queue at the first run of the first analysis
  const logic = new CrossCheckLogic(storage)

  await logic.firstAnalysis(testDateTime.valueOf())
  const update = spyOnStorage.calls.first().args[0] as CrossCheckStorageSchema
  // 4 Pending voters will be active after the crosscheck (and leave the queue),
  // and 4 Not Found should be added to the queue
  expect(Object.entries(update.queue)).toHaveLength(4)
  expect(mockedRecheck).toBeCalledTimes(10)

  // We expect 6 registrations to be 'Active' by now
  let activeCount = 0
  mockedRecheck.mock.calls.flat().forEach((resp: {alloyStatus: AlloyStatus}) => {
    if (resp.alloyStatus.status === 'Active') activeCount++
  })

  expect(activeCount).toBe(6)
})

test('CrossCheckLogic works to recheck the items after the first analysis', async () => {
  const storage = mockStorage(entriesDateTime.valueOf(), false, mockQueue(0, 4, 6))
  const spyOnStorage = spyOn(storage, 'update')
  const mockedRecheck = mockRecheckRegistrations()
  // There should be no items in the queue at the first run of the first analysis
  const logic = new CrossCheckLogic(storage)

  await logic.enqueued(testDateTime.valueOf())
  const update = spyOnStorage.calls.first().args[0] as CrossCheckStorageSchema
  // 4 Pending voters will be active after the crosscheck (and leave the queue),
  // and 6 Not Found should be added to the queue
  expect(Object.entries(update.queue)).toHaveLength(6)
  expect(mockedRecheck).toBeCalledTimes(10)

  // We expect 4 registrations to be 'Active' by now
  let activeCount = 0
  mockedRecheck.mock.calls.flat().forEach((resp: {alloyStatus: AlloyStatus}) => {
    if (resp.alloyStatus.status === 'Active') activeCount++
  })

  expect(activeCount).toBe(4)
})
