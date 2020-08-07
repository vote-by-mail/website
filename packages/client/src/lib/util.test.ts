import { formatPhoneNumber, e164 } from '../../../common/util'

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
      const formattedPhone = await formatPhoneNumber(received)
      expect(formattedPhone).toEqual(expected)
    }
  )

  test.each(invalidPhoneNumbers)(
    `formatPhoneNumber fails for %i`,
    async (invalidPhoneNumber) => {
      expect(invalidPhoneNumber).toEqual(invalidPhoneNumber)
    }
  )
})

describe('Test e164 function', () => {
  it('works', () => {
    const validE164Phone = e164(validPhones[0].received)
    expect(validE164Phone).toEqual(validPhones[0].received)
  })

  it('throws error', () => {
    expect(() => e164(invalidPhoneNumbers[0])).toThrow(`Regex failed to match ${invalidPhoneNumbers[0]}`)
  })
})
