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

const invalidPhoneNumbers = ["1231231234", "1112223333"]

describe('formatPhoneNumber', () => {
  test.each(validPhones)(
    `formatPhoneNumber work for %i`,
    async ({received, expected}) => {
      expect(formatPhoneNumber(received)).toEqual(expected)
    }
  )

  test.each(invalidPhoneNumbers)(
    `formatPhoneNumber fails for %i`,
    async (invalidPhoneNumber) => {
      expect(formatPhoneNumber(invalidPhoneNumber)).toEqual(invalidPhoneNumber)
    }
  )
})

describe('Test checkE164 function', () => {
  test.each(validPhones)(
    `checkE164 function works for %i`,
    async ({ received }) => {
      expect(isE164(received)).toHaveReturned()
    }
  )

  test.each(invalidPhoneNumbers)(
    `checkE164 function throws for %i`,
    async (invalidPhoneNumber) => {
      expect(invalidPhoneNumber).toThrowError()
    }
  )
})
