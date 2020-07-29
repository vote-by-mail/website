export interface _Id {
  id?: string
}

export type WithoutId<T extends {}> = Omit<T, 'id'>
export type WithId<T extends {}> = T & {id: string}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const formatPhoneNumber = (phoneNumberString: string): string => {
  const cleaned = phoneNumberString.replace(/^\+[0-9]/, '').replace(/[^a-zA-Z0-9]/g,'')
  const validPhoneNumber = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  let formattedPhoneNumber
  if (validPhoneNumber) {
    formattedPhoneNumber = '(' + validPhoneNumber[1] + ') ' + validPhoneNumber[2] + '-' + validPhoneNumber[3]
  }
  
  const match = formattedPhoneNumber && formattedPhoneNumber.match(/^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/)

  if(match && formattedPhoneNumber){
    return formattedPhoneNumber
  } else {
    throw new Error(`Invalid Phone Number`)
  }
}