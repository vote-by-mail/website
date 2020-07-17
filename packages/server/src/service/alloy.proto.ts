import { alloy } from './alloy'
import { StateInfo, processEnvOrThrow } from '../common'

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started

const activeVoter: StateInfo = {
  name: 'Terrence Brown', birthdate: '1963-05-05',
  address: {
    postcode: '20020',
    stateAbbr: 'DC', state: '', city: 'Washington',
    street: 'Pecan Acre Ln', streetNumber: '2969',
    country: '', fullAddr: '', queryAddr: '',
  },
} as StateInfo
const inactiveVoter: StateInfo = {
  name: 'Mia Jackson', birthdate: '1996-12-21',
  address: {
    postcode: '19701',
    stateAbbr: 'DE', state: '', city: 'Bear',
    street: 'Oak Lawn Ave', streetNumber: '1067',
    country: '', fullAddr: '', queryAddr: '',
  },
} as StateInfo

const testStatus = async (voter: StateInfo) => {
  console.log(`Detecting if ${voter.name} can vote.`)
  try {
    const resp = await alloy.isRegistered(voter)
    console.log(`The current registration status for ${voter.name} is: ${resp}`)
  } catch(e) {
    console.log(`Error while trying to detect ${voter.name} vote registration status`)
    console.error(e)
  }
}

const main = async () => {
  await testStatus(activeVoter)
  await testStatus(inactiveVoter)
  // Only needed to test if ALLOY_RELAXED
  if (processEnvOrThrow('ALLOY_RELAXED') !== 'false') {
    activeVoter.name = 'Unregistered Voter'
    await testStatus(activeVoter)
  }
}

main()
