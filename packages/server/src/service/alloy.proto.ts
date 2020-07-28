import { isRegistered } from './alloy'
import { RegistrationArgs } from '../common'

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started

const activeVoter: RegistrationArgs = {
  firstName: 'Terrence', lastName: 'Brown', birthdate: '1963-05-05',
  address: {
    stateAbbr: 'DC', city: 'Washington', postcode: '20020',
    street: 'Pecan Acres Ln', streetNumber: '2969',
  }
}

const inactiveVoter: RegistrationArgs = {
  firstName: 'Mia', lastName: 'Jackson', birthdate: '1996-12-21',
  address: {
    stateAbbr: 'DE', city: 'Bear', postcode: '19701',
    street: 'Oak Lawn Ave', streetNumber: '1067',
  }
}

const notFoundVoter: RegistrationArgs = {
  firstName: 'Brandie', lastName: 'Nguyen', birthdate: '1946-12-11',
  address: {
    stateAbbr: 'AK', city: 'Wasilla', postcode: '99654',
    streetNumber: '9015', street: 'Fairview St',
  },
}

const cancelledVoter: RegistrationArgs = {
  firstName: 'Peggy', lastName: 'Lee', birthdate: '1993-11-26',
  address: {
    stateAbbr: 'AZ', city: 'Tucson', postcode: '85718',
    streetNumber: '5737', street: 'Homestead Rd',
  },
}

const purgedVoter: RegistrationArgs = {
  firstName: 'Rebecca', lastName: 'Jones', birthdate: '1946-12-22',
  address: {
    stateAbbr: 'CT', city: 'Vernon Rockville', postcode: '06066',
    streetNumber: '8135', street: 'Woodland St',
  },
}

const notReportedVoter: RegistrationArgs = {
  firstName: 'Catherine', lastName: 'Medina', birthdate: '1977-03-01',
  address: {
    stateAbbr: 'IN', city: 'Brownsburg', postcode: '46112',
    streetNumber: '7438', street: 'W Sherman Dr',
  },
}

const pendingVoter: RegistrationArgs = {
  firstName: 'Cecil', lastName: 'Flores', birthdate: '1979-10-13',
  address: {
    stateAbbr: 'IA', city: 'Ankeny', postcode: '50023',
    streetNumber: '1343', street: 'Smokey Ln',
  },
}

const provisionalVoter: RegistrationArgs = {
  firstName: 'Rhonda', lastName: 'Jordan', birthdate: '1992-11-15',
  address: {
    stateAbbr: 'MT', city: 'Butte', postcode: '59701',
    streetNumber: '4498', street: 'Northaven Rd',
  },
}

const preregisteredVoter: RegistrationArgs = {
  firstName: 'Guy', lastName: 'Graves', birthdate: '2003-06-01',
  address: {
    stateAbbr: 'NY', city: 'Massapequa Park', postcode: '11762',
    streetNumber: '5851', street: 'W Belt Line Rd',
  },
}

const removedVoter: RegistrationArgs = {
  firstName: 'George', lastName: 'Woods', birthdate: '1990-07-30',
  address: {
    stateAbbr: 'NC', city: 'Elizabeth City', postcode: '27909',
    streetNumber: '1101', street: 'Karen Dr',
  },
}

const challengedVoter: RegistrationArgs = {
  firstName: 'Diana', lastName: 'Washington', birthdate: '1970-08-24',
  address: {
    stateAbbr: 'VT', city: 'Ascutney', postcode: '05030',
    streetNumber: '6117', street: 'Paddock Way',
  },
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
  await testStatus(notFoundVoter)
  await testStatus(cancelledVoter)
  await testStatus(purgedVoter)
  await testStatus(notReportedVoter)
  await testStatus(pendingVoter)
  await testStatus(provisionalVoter)
  await testStatus(preregisteredVoter)
  await testStatus(removedVoter)

  await testStatus(challengedVoter)
  // Only needed to test if ALLOY_RELAXED
  if (process.env.ALLOY_RELAXED) {
    activeVoter.firstName = 'Unregistered'
    activeVoter.lastName = 'Voter'
    await testStatus(activeVoter)
    activeVoter.firstName = 'Not Found'
    activeVoter.lastName = 'Voter'
    await testStatus(activeVoter)
  }
}

main()
