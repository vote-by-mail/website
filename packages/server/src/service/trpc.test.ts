import { sampleStateInfo } from './letter'
import { mocked } from 'ts-jest/utils'
import { VbmRpc } from './trpc'
import { Request } from 'express'
import { sendFaxes as unmockedSendFaxes } from './twilio'
import { isE164 } from '../common'
import { createMock } from 'ts-auto-mock'
import { sendSignupEmail } from './mg'

// To avoid doing actual requests (and setting a lot of new envs for tests),
// we mock the majority of functions/modules related to trpc.

jest.mock('./mg')
mocked(sendSignupEmail).mockResolvedValue({ message: 'Queued. Thank you.', id: 'dummy' })
jest.mock('./twilio')
jest.mock('./firestore')
jest.mock('./pdf')
jest.mock('./alloy/storage')
jest.mock('./storage', () => {
  // Classes are only automatically mocked if they are using default exports
  const StorageFile = jest.fn().mockImplementation((_: string) => ({
    async upload() { return 'mocked_id' },
    async getSignedUrl() { return 'mocked' },
  }))

  // If we return undefined (default mock behavior) it will throw errors
  const storageFileFromId = jest.fn().mockImplementation((id: string) => {
    return new StorageFile(id)
  })

  return {
    StorageFile,
    storageFileFromId,
  }
})

const sendFaxes = mocked(unmockedSendFaxes).mockResolvedValue([])

const trpc = new VbmRpc()

test('trpc.register uses e164 number on sendFaxes', async () => {
  const stateInfo = await sampleStateInfo('Maine')

  const req = createMock<Request>({
    headers: { "user-agent": 'test' },
    connection: {
      remoteAddress: '127.0.0.1',
    }
  })
  const res = await trpc.register(stateInfo, { uid: 'abcdefghij' }, req)
  // Ensures res.data is processed
  const cont = res?.continuation as () => Promise<void>
  await cont()

  expect(sendFaxes).toHaveBeenCalledTimes(1)
  // [ [ 'url', [ '+12078763198' ] ] ]
  expect(sendFaxes.mock.calls).toHaveLength(1)
  const faxNumbers = sendFaxes.mock.calls[0][1]
  expect(faxNumbers.every(isE164)).toBe(true)
})
