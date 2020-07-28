import { processEnvOrThrow, RegistrationStatus, RegistrationArgs } from '../common'
import axios, { AxiosResponse } from 'axios'
import rax from 'retry-axios'

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

export const isRegistered = async ({
  firstName, lastName, birthdate,
  address,
}: RegistrationArgs): Promise<RegistrationStatus> => {
  if (alloyMock) {
    return `${firstName.toLowerCase()} ${lastName.toLowerCase()}` !== 'unregistered voter'
      ? 'Active'
      : 'Unregistered'
  }

  const normalizedAddress = `${address.streetNumber} ${address.street}`
  const query = [
    `first_name=${firstName}`,
    `last_name=${lastName}`,
    birthdate ? `birth_date=${birthdate}` : '',
    `address=${normalizedAddress}`,
    `city=${address.city}`,
    `state=${address.stateAbbr}`,
    `zip=${address.postcode}`,
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

  return response.data.data.registration_status
}
