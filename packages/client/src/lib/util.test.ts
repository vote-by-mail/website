import { formatPhoneNumber, isE164 } from '../../../common/util'

const validPhones = [
  {
    received: "+11231231234",
    expected: "(123)-123-1234",
  },{
    received: "+19174234177",
    expected: "(917)-423-4177",
  }
  ,{
    received: "+19174234177x123",
    expected: "(917)-423-4177 Ext. 123",
  }
]

describe('formatPhoneNumber', () => {
  test.each(validPhones)(
    `formatPhoneNumber work for %s`,
    async ({received, expected}) => {
      expect(formatPhoneNumber(received)).toEqual(expected)
    }
  )

  const invalidPhoneNumbers = ["123-4567", "123456789"]

  test.each(invalidPhoneNumbers)(
    `formatPhoneNumber fails for %s`,
    async (invalidPhoneNumber) => {
      expect(formatPhoneNumber(invalidPhoneNumber)).toEqual(invalidPhoneNumber)
    }
  )
})

describe('Test isE164 function', () => {
  test.each(validPhones)(
    `isE164 function works for %s`,
    async ({ received }) => {
      expect(isE164(received)).toBe(true)
    }
  )

  const invalidPhoneNumbers = ["1231231234", "1112223333"]

  test.each(invalidPhoneNumbers)(
    `isE164 function throws for %i`,
    async (invalidPhoneNumber) => {
      expect(isE164(invalidPhoneNumber)).toBe(false)
    }
  )
})
