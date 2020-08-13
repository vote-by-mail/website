export interface _Id {
  id?: string
}

export type WithoutId<T extends {}> = Omit<T, 'id'>
export type WithId<T extends {}> = T & {id: string}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** phone numbers must be E164 for Twilio: https://www.twilio.com/docs/glossary/what-e164 */
const regex = /^\+1\d{10}(x\d+)?$/
export const checkE164 = (number: string) => {
  const e164Number = number.match(regex)
  if (!e164Number) throw Error(`Regex failed to match ${number}`)
  return null
}

export const formatPhoneNumber = (phoneNumberString: string): string => {
  const cleaned = phoneNumberString.replace(/^\+[0-9]/, '')
  const splitPhoneNumber = cleaned.match(/^(\d{3})(\d{3})(\d{4})(x\d+)?$/)
  let formattedPhoneNumber = splitPhoneNumber && '(' + splitPhoneNumber[1] + ')-' + splitPhoneNumber[2] + '-' + splitPhoneNumber[3]
  formattedPhoneNumber = splitPhoneNumber && splitPhoneNumber[4] ? formattedPhoneNumber + ' Ext. ' + splitPhoneNumber[4].replace('x', '') : formattedPhoneNumber

  return formattedPhoneNumber || phoneNumberString
}