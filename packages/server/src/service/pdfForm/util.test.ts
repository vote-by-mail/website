import { stripPhoneNumber } from './util'

describe('Phone number stripper', () => {
  test.each(['+1 (123)-456-7890', '123-456-7890', '1234567890', '+11234567890'])(
    `Stripped phone number for %i`,
    async phoneNumber => {
      const strippedPhoneNumber = stripPhoneNumber(phoneNumber)
      expect(strippedPhoneNumber).toEqual('1234567890')
    }
  )
})
