import { processEnvOrThrow, StateInfo, RegistrationStatus } from '../common'
import axios, { AxiosResponse } from 'axios'
import rax from 'retry-axios'

// Env & axios refactoring

const alloyRelaxed = processEnvOrThrow('ALLOY_RELAXED')
const apiKey = processEnvOrThrow('ALLOY_API_KEY')
const apiSecret = processEnvOrThrow('ALLOY_API_SECRET')
const apiUrl = 'https://api.alloy.us/v1'
const commonAxiosSettings = {
  auth: {username: apiKey, password: apiSecret},
  withCredentials: true,
}

/** Converts StateInfo to URL query params */
const stateInfoToParams = (info: StateInfo) => {
  const nameSplit = info.name.split(' ')
  const firstName = nameSplit[0]
  const lastName = nameSplit[nameSplit.length - 1]
  const { city, stateAbbr: state, street, streetNumber, postcode: zip } = info.address
  const address = `${streetNumber} ${street}`

  return encodeURI(
    [
      `first_name=${firstName}`,
      `last_name=${lastName}`,
      `birth_date=${info.birthdate}`,
      `address=${address}`,
      `city=${city}`,
      `state=${state}`,
      `zip=${zip}`,
    ].join('&')
  )
}

interface AlloyResponse {
  data: {
    // There are other possible registration_status, but for our interests
    // only to know if !== 'Active' is enough
    registration_status: RegistrationStatus
  }
}

class Alloy {
  /**
   * Returns true if a voter can vote, false otherwise.
   */
  public isRegistered = async (voter: StateInfo): Promise<RegistrationStatus> => {
    const url = `${apiUrl}/verify?${stateInfoToParams(voter)}`

    if (alloyRelaxed !== 'false') {
      return voter.name.toLowerCase() !== 'unregistered voter'
        ? 'Active'
        : null
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

    // Because Alloy can return null, mostly when voters are unregistered
    // https://docs.alloy.us/api/#/paths/~1v1~1verify/get, we default this
    // response to Unregistered on null
    return response.data.data.registration_status
  }
}

export const alloy = new Alloy()
