export interface _Id {
  id?: string
}

export type WithoutId<T extends {}> = Omit<T, 'id'>
export type WithId<T extends {}> = T & {id: string}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** phone numbers must be E164 for Twilio: https://www.twilio.com/docs/glossary/what-e164 */
const regex = /^\+1\d{10}(x\d+)?$/

/**
 * Function returns if string is e164
 **/
export const isE164 = (number: string): boolean => {
  return !!number.match(regex)
}

/**
 * Nicely formats an E164 string or returns string if it does not match regex
 **/
export const formatPhoneNumber = (phoneNumberString: string): string => {
  const cleaned = phoneNumberString.replace(/^\+[0-9]/, '')
  const splitPhoneNumber = cleaned.match(/^(\d{3})(\d{3})(\d{4})(x\d+)?$/)
  let formattedPhoneNumber = splitPhoneNumber && '(' + splitPhoneNumber[1] + ')-' + splitPhoneNumber[2] + '-' + splitPhoneNumber[3]
  formattedPhoneNumber = splitPhoneNumber && splitPhoneNumber[4] ? formattedPhoneNumber + ' Ext. ' + splitPhoneNumber[4].replace('x', '') : formattedPhoneNumber

  return formattedPhoneNumber || phoneNumberString
}