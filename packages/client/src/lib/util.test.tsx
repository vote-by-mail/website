import { formatPhoneNumber } from '../../../common/util'

describe('formatPhoneNumber', () => {
  const validPhones = [
    {
      received: "1231231234", 
      expected: "(123) 123-1234",
    },{
      received: "917-423-4177",
      expected: "(917) 423-4177",
    },{
      received: "(321) 3214321",
      expected: "(321) 321-4321",
    },{
      received: "+14414567823",
      expected: "(441) 456-7823",
    }
  ]

  const invalidPhoneNumbers = ["a1234321245", "123123123123", "asbfi", "123", "///---123"]

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
      expect(() => formatPhoneNumber(invalidPhoneNumber)).toThrow('Invalid Phone Number')
    }
  )
})
