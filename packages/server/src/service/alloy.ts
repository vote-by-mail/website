import { processEnvOrThrow, RegistrationStatus, RegistrationArgs } from '../common'
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

const rawIsRegistered = async ({
  firstName, lastName, birthdate,
  address,
}: RegistrationArgs): Promise<RegistrationStatus> => {
  if (alloyMock) {
    if (lastName.toLowerCase() === 'voter') {
      switch (firstName.toLowerCase()) {
        case 'active': return 'Active'
        case 'challenged': return 'Challenged'
        case 'not eligible': return 'Not Eligible'
        case 'not found': return 'Not Found'
        case 'denied': return 'Denied'
        case 'inactive': return 'Inactive'
        case 'pending': return 'Pending'
        case 'confirmation': return 'Confirmation'
        case 'removed': return 'Removed'
        case 'preregistered': return 'Preregistered'
        case 'rejected': return 'Rejected'
        case 'unregistered': return 'Unregistered'
        case 'verify': return 'Verify'
        case 'cancelled': return 'Cancelled'
        case 'incomplete': return 'Incomplete'
        case 'purged': return 'Purged'
        case 'not reported': return 'Not Reported'
        case 'suspense': return 'Suspense'
        case 'provisional': return 'Provisional'
        case 'null': return null
      }
    }
    return 'Active'
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

  // When not found Alloy API returns null, we default this to Not Found
  return response.data.data.registration_status ?? 'Not Found'
}

const cacheIsRegistered = cache(
  rawIsRegistered,
  async x => `Voter ${x.firstName} ${x.lastName}`,
)

export const isRegistered = (voter: RegistrationArgs, cacheResult?: boolean) => {
  return cacheResult ? cacheIsRegistered(voter) : rawIsRegistered(voter)
}
