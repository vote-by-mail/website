import { isRegistered } from './alloy'
import { RegistrationArgs } from '../common'

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started

const activeVoter: RegistrationArgs = {
  firstName: 'Terrence', lastName: 'Brown', birthdate: '1963-05-05',
  stateAbbr: 'DC', city: 'Washington', postcode: '20020',
  street: 'Pecan Acre Ln', streetNumber: '2969',
}

const inactiveVoter: RegistrationArgs = {
  firstName: 'Mia', lastName: 'Jackson', birthdate: '1996-12-21',
  stateAbbr: 'DE', city: 'Bear', postcode: '19701',
  street: 'Oak Lawn Ave', streetNumber: '1067',
}

const testStatus = async (voter: RegistrationArgs) => {
  const name = `${voter.firstName} ${voter.lastName}`
  console.log(`Detecting if ${name} can vote.`)
  try {
    const resp = await isRegistered(voter)
    console.log(`The current registration status for ${name} is: ${resp}`)
  } catch(e) {
    console.log(`Error while trying to detect ${name} vote registration status`)
    console.error(e)
  }
}

const main = async () => {
  await testStatus(activeVoter)
  await testStatus(inactiveVoter)
  // Only needed to test if ALLOY_RELAXED
  if (process.env.ALLOY_RELAXED) {
    activeVoter.firstName = 'Unregistered'
    activeVoter.lastName = 'Voter'
    await testStatus(activeVoter)
  }
}

main()
