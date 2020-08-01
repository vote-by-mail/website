import { processEnvOrThrow, RegistrationStatus, RegistrationArgs, allRegistrationStatus } from '../common'
import axios, { AxiosResponse } from 'axios'
import rax from 'retry-axios'
import { cache } from './util'

// Env & axios refactoring

const alloyMock= process.env.ALLOY_MOCK
const apiKey = processEnvOrThrow('ALLOY_API_KEY')
const apiSecret = processEnvOrThrow('ALLOY_API_SECRET')
const apiUrl = 'https://api.alloy.us/v1'
const commonAxiosSettings = {
  auth: {username: apiKey, password: apiSecret},
  withCredentials: true,
}

interface AlloyResponse {
  data: {
    // There are other possible registration_status, but for our interests
    // only to know if !== 'Active' is enough
    registration_status: RegistrationStatus
  }
}

const lowercaseStatuses = allRegistrationStatus.map(x => x.toLowerCase())

// Alloys only accepts YYYY-MM-DD as date format
const toAlloyBirthdate = (vbmBirthdate: string) => {
  const split = vbmBirthdate.split('/')
  return `birth_date=${split[2]}-${split[0]}-${split[1]}`
}

export const isRegistered = async ({
  firstName, lastName, birthdate,
  stateAbbr, city, postcode,
  street, streetNumber,
}: RegistrationArgs): Promise<RegistrationStatus> => {
  if (alloyMock) {
    // Allows for case insensitive names when testing, since Alloy API returns
    // these statuses capitalized, and some have more than one word, e.g.
    // Not Found, Not Reported.
    if (lastName.toLowerCase() === 'voter') {
      const indexOf = lowercaseStatuses.indexOf(firstName.toLowerCase())
      return indexOf >= 0 ? allRegistrationStatus[indexOf] : 'Active'
    }
    return 'Active'
  }

  const address = `${streetNumber} ${street}`
  const query = [
    `first_name=${firstName}`,
    `last_name=${lastName}`,
    birthdate ? toAlloyBirthdate(birthdate) : '',
    `address=${address}`,
    `city=${city}`,
    `state=${stateAbbr}`,
    `zip=${postcode}`,
  ].join('&')
  const url = `${apiUrl}/verify?${query}`

  // 429 means we are firing more requests than our maximum rate per second,
  // to avoid alerting users about this, we use retry-axios on this request
  const axiosInstance = axios.create()
  rax.attach(axiosInstance)
  const response = await axiosInstance({
    ...commonAxiosSettings,
    url,
    raxConfig: {
      retry: 4,
      noResponseRetries: 0,
      statusCodesToRetry: [[429, 429]],
      backoffType: 'exponential',
    }
  }) as AxiosResponse<AlloyResponse>

  // When not found Alloy API returns null, we default this to Not Found
  return response.data.data.registration_status ?? 'Not Found'
}

export const cacheIsRegistered = cache(
  isRegistered,
  async x => `Voter ${x.firstName} ${x.lastName}`,
)
