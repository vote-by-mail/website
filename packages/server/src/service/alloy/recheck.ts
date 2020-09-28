import { isRegistered, isRegisteredByAlloyId } from './isRegistered'
import { getStateAbbr, State, NameParts, AlloyStatus, Address, RegistrationStatus, processEnvOrThrow } from '../../common'

const alloyRecheckInterval: number = + processEnvOrThrow('ALLOY_RECHECK_INTERVAL')

export interface StateInfoForAlloy {
  id: string
  birthdate: string
  name: string
  nameParts?: NameParts
  address: Address
  alloy: AlloyStatus
}

const extractNameParts = (id: string, name: string): NameParts => {
  const splitName = name.split(' ')
  switch (splitName.length) {
    case 2: return {
      first: splitName[0],
      last: splitName[1],
    }

    case 3: {
      const hasSuffix = name.match(/\s(sr|jr|iii|iv|v)(\.*)$/i)
      return {
        first: splitName[0],
        middle: hasSuffix ? undefined : splitName[1],
        last: splitName[hasSuffix ? 1 : 2],
        suffix: hasSuffix ? splitName[2] : undefined
      }
    }
    case 4: return {
      first: splitName[0],
      middle: splitName[1],
      last: splitName[2],
      suffix: splitName[3],
    }

    // Unsupported values
    default: throw new Error(`Voter ${id} has a unsupported name and registered before nameParts was split.`)
  }
}

/**
 * When voters don't have a Alloy ID we'll fetch their registration status
 * by manually requesting through Alloy API. Some orgs might have voters
 * before we've had split name/address, this is a compatibility function that
 * ensures we can still fetch data for these voters.
 */
const checkRegistrationByVoterData = async (
  timestamp: number,
  /** Not Alloy ID, but the actual ID from the StateInfo storage document */
  id: string,
  address: Address,
  name: string,
  nameParts: NameParts | undefined,
  birthdate: string,
): Promise<AlloyStatus> => {
  // Older submissions might not have nameParts
  if (!nameParts) nameParts = extractNameParts(id, name)

  // Using the original Address type as fallback for older submissions
  const city = address?.addressParts?.city ?? address.city
  const postcode = address?.addressParts?.postcode ?? address.postcode
  const stateAbbr = getStateAbbr((address?.addressParts?.state ?? '') as State) ?? address.stateAbbr
  const street = address?.addressParts?.street ?? address.street
  const unit = address?.addressParts?.unit ?? address.unit

  if (!city || !postcode || !stateAbbr || !street) {
    throw new Error(`The values [city, postcode, stateAbbr, street] cannot be obtained for voter ${id}`)
  }

  const alloyResp = await isRegistered({
    nameParts, birthdate,
    city, postcode, stateAbbr, street, unit,
  })

  return {
    ...alloyResp,
    timestamp,
  }
}

const checkRegistrationByAlloyId = async (timestamp: number, alloydId: string): Promise<AlloyStatus> => {
  return {
    id: alloydId,
    status: await isRegisteredByAlloyId(alloydId),
    timestamp,
  }
}

/** Registration status that are still susceptible for changes */
export const unfinishedRegistrationStatus: Array<RegistrationStatus | undefined> = [
  'Inactive', 'Not Found', 'Pending', 'Error',
]

/**
 * Returns true if the data from StateInfo indicates that a cross-check
 * update is available.
 *
 * This is true when 24 hours have passed since the last time this was
 * checked and when alloy.status is still expected to change (e.g. 'Pending', etc.)
 */
const shouldRecheck = (
  nowTimestamp: number,
  alloy: AlloyStatus | undefined,
) => {
  // These are the statuses that can trigger rechecks

  if (!unfinishedRegistrationStatus.includes(alloy?.status)) {
    // If the status is not one of the unfinished we don't have to recheck
    return false
  }

  return (nowTimestamp - (alloy?.timestamp ?? 0)) > alloyRecheckInterval
}

/**
 * Rechecks registration status for a stored StateInfo. This function
 * will only perform requests when needed, returning null if there's no need
 * to recheck registration.
 */
export const recheckRegistration = async (info: StateInfoForAlloy): Promise<AlloyStatus | null> => {
  const { id, address, name, nameParts, birthdate, alloy } = info
  if (!id) {
    throw new Error('Voter ID should be defined by this point')
  }
  const now = new Date()
  const shouldUpdate = shouldRecheck(now.valueOf(), alloy)

  if (shouldUpdate) {
    try {
      return alloy?.id
        ? await checkRegistrationByAlloyId(now.valueOf(), alloy.id)
        : await checkRegistrationByVoterData(now.valueOf(), id, address, name, nameParts, birthdate)
    } catch(error) {
      console.error(error)
      // In case alloy fails or the request cannot be made, instead of throwing
      // the at recheckRegistration we'll record the error here--so when organizers
      // fetch .csv files we don't return them empty responses because of one single
      // voter.
      return {
        status: 'Error',
        timestamp: now.valueOf(),
      }
    }
  }

  return null
}
