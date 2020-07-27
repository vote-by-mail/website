import { processEnvOrThrow, RegistrationStatus, RegistrationArgs } from '../common'
import axios, { AxiosResponse } from 'axios'
import rax from 'retry-axios'

// Env & axios refactoring

const alloyRelaxed = process.env.ALLOY_RELAXED
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
  stateAbbr, city, postcode,
  street, streetNumber,
}: RegistrationArgs): Promise<RegistrationStatus> => {
  const address = `${streetNumber} ${street}`
  const query = [
    `first_name=${firstName}`,
    `last_name=${lastName}`,
    birthdate ? `birth_date=${birthdate}` : '',
    `address=${address}`,
    `city=${city}`,
    `state=${stateAbbr}`,
    `zip=${postcode}`,
  ].join('&')
  const url = `${apiUrl}/verify?${query}}`

  if (alloyRelaxed) {
    return `${firstName.toLowerCase()} ${lastName.toLowerCase()}` !== 'unregistered voter'
      ? 'Active'
      : 'Unregistered'
  }

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
