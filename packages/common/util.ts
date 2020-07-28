export interface _Id {
  id?: string
}

export type WithoutId<T extends {}> = Omit<T, 'id'>
export type WithId<T extends {}> = T & {id: string}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const formatPhoneNumber = (phoneNumberString: string) => {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '')
  const validPhoneNumber = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  let formattedPhoneNumber
  if (validPhoneNumber) {
    formattedPhoneNumber = '(' + validPhoneNumber[1] + ') ' + validPhoneNumber[2] + '-' + validPhoneNumber[3]
  }
  
  const match = formattedPhoneNumber.match(/^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/)

  if(match){
    return formattedPhoneNumber
  } else {
    throw new Error(`Invalid Phone Number`)
  }
}