import { processEnvOrThrow, RegistrationStatus, RegistrationArgs, allRegistrationStatus, AlloyResponse } from '../../common'
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import rax from 'retry-axios'
import { cache } from '../util'

// Env & axios refactoring

const alloyMock= process.env.ALLOY_MOCK
const apiKey = processEnvOrThrow('ALLOY_API_KEY')
const apiSecret = processEnvOrThrow('ALLOY_API_SECRET')
const apiUrl = 'https://api.alloy.us/v1'
const commonAxiosSettings = {
  auth: {username: apiKey, password: apiSecret},
  withCredentials: true,
}

interface AxiosAlloyResponse {
  data: {
    id: string
    registration_status: RegistrationStatus
  }
}

const lowercaseStatuses = allRegistrationStatus.map(x => x.toLowerCase())

/**
 * 429 means we are firing more requests than our maximum rate per second,
 * to avoid alerting users about this, we use retry-axios on this request
 */
const retryRequest = async (requestConfig: AxiosRequestConfig): Promise<AxiosAlloyResponse> => {
  const axiosInstance = axios.create()
  rax.attach(axiosInstance)
  const response = await axiosInstance({
    ...requestConfig,
    raxConfig: {
      retry: 4,
      noResponseRetries: 0,
      statusCodesToRetry: [[429, 429]],
      backoffType: 'exponential',
    },
  }) as AxiosResponse<AxiosAlloyResponse>

  return response.data
}

/**
 * Converts MM/DD/YYYY dates to YYYY-MM-DD, since Alloy only accepts this
 * date-format.
 *
 * Exported for testing purposes.
 *
 * @param vbmBirthdate MM/DD/YYYY date input sanitized by the front-end
 */
export const toAlloyDate = (vbmBirthdate: string) => {
  const split = vbmBirthdate.split('/')
  return `${split[2]}-${split[0]}-${split[1]}`
}

/**
 * Fetches the registration status of a voter by manually querying the
 * records with the information from StateInfo
 */
export const isRegistered = async ({
  nameParts, birthdate,
  stateAbbr, city, postcode,
  street, unit,
}: RegistrationArgs): Promise<AlloyResponse> => {
  if (alloyMock) {
    // Allows for case insensitive names when testing, since Alloy API returns
    // these statuses capitalized, and some have more than one word, e.g.
    // Not Found, Not Reported.
    if (nameParts.last.toLowerCase() === 'voter') {
      const indexOf = lowercaseStatuses.indexOf(nameParts.first.toLowerCase())
      return {
        id: '00000000-0000-0000-0000-000000000000',
        status: indexOf >= 0 ? allRegistrationStatus[indexOf] : 'Active',
      }
    }
    return { status: 'Active', id: '00000000-0000-0000-0000-000000000000', }
  }

  const address = unit
    ? `${street} # ${unit}`
    : street

  const query = [
    `first_name=${nameParts.first}`,
    nameParts.middle ? `middle_name=${nameParts.middle}` : null,
    `last_name=${nameParts.last}`,
    nameParts.suffix ? `suffix=${nameParts.suffix}` : null,
    birthdate ? `birth_date=${toAlloyDate(birthdate)}` : null,
    `address=${address}`,
    `city=${city}`,
    `state=${stateAbbr}`,
    `zip=${postcode}`,
  ].filter(str => !!str).join('&')
  const url = `${apiUrl}/verify?${query}`

  const response = await retryRequest({...commonAxiosSettings, url})

  const id = response.data.id
  // When not found Alloy API returns null, we default this to Not Found
  const status =  response.data.registration_status ?? 'Not Found'

  return { status, id }
}

export const cacheIsRegistered = cache(
  isRegistered,
  async x => `Voter ${x.nameParts.first} ${x.nameParts.last}`,
)

/**
 * Fetches the registration status of a voter by its Alloy ID
 */
export const isRegisteredByAlloyId = async (id: string): Promise<RegistrationStatus> => {
  const url = `${apiUrl}/voters/${id}`

  try {
    const response = await retryRequest({...commonAxiosSettings, url})
    // When not found Alloy API returns null, we default this to Not Found
    return response.data.registration_status ?? 'Not Found'
  } catch(error) {
    // We don't use console.error here since this might be a simple timeout
    // error or exceeding the maximum amount of requests
    console.warn(error)
    return 'Error'
  }
}
