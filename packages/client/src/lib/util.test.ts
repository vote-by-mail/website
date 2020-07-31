import { formatPhoneNumber } from '../../../common/util'

describe('formatPhoneNumber', () => {
  const validPhones = [
    {
      received: "+11231231234", 
      expected: "(123) 123-1234",
    },{
      received: "+19174234177",
      expected: "(917) 423-4177",
    }
  ]

  const invalidPhoneNumbers = ["1231231234", "1112223333"]

  test.each(validPhones)(
    `formatPhoneNumber work for %i`,
    async ({received, expected}) => {
      const formattedPhone = await formatPhoneNumber(received)
      expect(formattedPhone).toEqual(expected)
    }
  )

  test.each(invalidPhoneNumbers)(
    `formatPhoneNumber fails for %i`,
    async (invalidPhoneNumber) => {
      expect(() => formatPhoneNumber(invalidPhoneNumber)).toThrow(`Regex failed to match fax ${invalidPhoneNumber}`)
    }
  )
})
