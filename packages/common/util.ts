export interface _Id {
  id?: string
}

export type WithoutId<T extends {}> = Omit<T, 'id'>
export type WithId<T extends {}> = T & {id: string}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** phone numbers must be E164 for Twilio: https://www.twilio.com/docs/glossary/what-e164 */
const regex = /^\+1\d{10}(x\d+)?$/
export const e164 = (number: string): string => {
  const e164Number = number.match(regex)
  if (!e164Number) throw Error(`Regex failed to match fax ${number}`)
  return e164Number[0]
}

export const formatPhoneNumber = (phoneNumberString: string): string => {
  const validE164PhoneNumber = e164(phoneNumberString)
  const cleaned = validE164PhoneNumber.replace(/^\+[0-9]/, '')
  const splitPhoneNumber = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  const formattedPhoneNumber = splitPhoneNumber && '(' + splitPhoneNumber[1] + ') ' + splitPhoneNumber[2] + '-' + splitPhoneNumber[3]

  return formattedPhoneNumber || phoneNumberString
}