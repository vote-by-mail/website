import { cleanPhoneNumber } from './util'

describe('Phone number stripper', () => {
  const testCases = [
    '+1 (123)-456-7890',
    ' +1 (123) 456 7890 ',
    '123-456-7890',
    '1234567890',
    '+11234567890'
  ]
  test.each(testCases)(
    `Stripped phone number for %i`,
    async phoneNumber => {
      const cleaned = cleanPhoneNumber(phoneNumber)
      expect(cleaned).toEqual('1234567890')
    }
  )
})
