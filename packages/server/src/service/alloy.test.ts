import { isRegistered } from './alloy'
import { RegistrationArgs } from '../common'

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started

const alloyMock = process.env.ALLOY_MOCK

const activeVoter = {
  firstName: alloyMock ? 'Active' : 'Terrence',
  lastName: alloyMock ? 'Voter' : 'Brown',
  birthdate: '1963-05-05',
  address: {
    stateAbbr: 'DC', city: 'Washington', postcode: '20020',
    street: 'Pecan Acres Ln', streetNumber: '2969',
  }
} as unknown as RegistrationArgs

const inactiveVoter = {
  firstName: alloyMock ? 'Inactive' : 'Mia',
  lastName: alloyMock ? 'Voter' : 'Jackson',
  birthdate: '1996-12-21',
  address: {
    stateAbbr: 'DE', city: 'Bear', postcode: '19701',
    street: 'Oak Lawn Ave', streetNumber: '1067',
  }
} as unknown as RegistrationArgs

const notFoundVoter = {
  firstName: alloyMock ? 'Not Found' : 'Brandie',
  lastName: alloyMock ? 'Voter' : 'Nguyen',
  birthdate: '1946-12-11',
  address: {
    stateAbbr: 'AK', city: 'Wasilla', postcode: '99654',
    streetNumber: '9015', street: 'Fairview St',
  },
} as unknown as RegistrationArgs

const cancelledVoter = {
  firstName: alloyMock ? 'Cancelled' : 'Peggy',
  lastName: alloyMock ? 'Voter' : 'Lee',
  birthdate: '1993-11-26',
  address: {
    stateAbbr: 'AZ', city: 'Tucson', postcode: '85718',
    streetNumber: '5737', street: 'Homestead Rd',
  },
} as unknown as RegistrationArgs

const purgedVoter = {
  firstName: alloyMock ? 'Purged' : 'Rebecca',
  lastName: alloyMock ? 'Voter' : 'Jones',
  birthdate: '1946-12-22',
  address: {
    stateAbbr: 'CT', city: 'Vernon Rockville', postcode: '06066',
    streetNumber: '8135', street: 'Woodland St',
  },
} as unknown as RegistrationArgs

const notReportedVoter = {
  firstName: alloyMock ? 'Not Reported' : 'Catherine',
  lastName: alloyMock ? 'Voter' : 'Medina',
  birthdate: '1977-03-01',
  address: {
    stateAbbr: 'IN', city: 'Brownsburg', postcode: '46112',
    streetNumber: '7438', street: 'W Sherman Dr',
  },
} as unknown as RegistrationArgs

const pendingVoter = {
  firstName: alloyMock ? 'Pending' : 'Cecil',
  lastName: alloyMock ? 'Voter' : 'Flores',
  birthdate: '1979-10-13',
  address: {
    stateAbbr: 'IA', city: 'Ankeny', postcode: '50023',
    streetNumber: '1343', street: 'Smokey Ln',
  },
} as unknown as RegistrationArgs

const provisionalVoter = {
  firstName: alloyMock ? 'Provisional' : 'Rhonda',
  lastName: alloyMock ? 'Voter' : 'Jordan',
  birthdate: '1992-11-15',
  address: {
    stateAbbr: 'MT', city: 'Butte', postcode: '59701',
    streetNumber: '4498', street: 'Northaven Rd',
  },
} as unknown as RegistrationArgs

const preregisteredVoter = {
  firstName: alloyMock ? 'Preregistered' : 'Guy',
  lastName: alloyMock ? 'Voter' : 'Graves',
  birthdate: '2003-06-01',
  address: {
    stateAbbr: 'NY', city: 'Massapequa Park', postcode: '11762',
    streetNumber: '5851', street: 'W Belt Line Rd',
  },
} as unknown as RegistrationArgs

const removedVoter = {
  firstName: alloyMock ? 'Removed' : 'George',
  lastName: alloyMock ? 'Voter' : 'Woods',
  birthdate: '1990-07-30',
  address: {
    stateAbbr: 'NC', city: 'Elizabeth City', postcode: '27909',
    streetNumber: '1101', street: 'Karen Dr',
  },
} as unknown as RegistrationArgs

const challengedVoter = {
  firstName: alloyMock ? 'Challenged' : 'Diana',
  lastName: alloyMock ? 'Voter' : 'Washington',
  birthdate: '1970-08-24',
  address: {
    stateAbbr: 'VT', city: 'Ascutney', postcode: '05030',
    streetNumber: '6117', street: 'Paddock Way',
  },
} as unknown as RegistrationArgs

test('Alloy Active Voter', async () => {
  expect(await isRegistered(activeVoter, true)).toBe('Active')
})
test('Alloy Inactive Voter', async () => {
  expect(await isRegistered(inactiveVoter, true)).toBe('Inactive')
})
test('Alloy Not Found Voter', async () => {
  expect(await isRegistered(notFoundVoter, true)).toBe('Not Found')
})
test('Alloy Cancelled Voter', async () => {
  expect(await isRegistered(cancelledVoter, true)).toBe('Cancelled')
})
test('Alloy Purged Voter', async () => {
  expect(await isRegistered(purgedVoter, true)).toBe('Purged')
})
test('Alloy Not Reported Voter', async () => {
  expect(await isRegistered(notReportedVoter, true)).toBe('Not Reported')
})
test('Alloy Pending Voter', async () => {
  expect(await isRegistered(pendingVoter, true)).toBe('Pending')
})
test('Alloy Provisional Voter', async () => {
  expect(await isRegistered(provisionalVoter, true)).toBe('Provisional')
})
test('Alloy Preregistered Voter', async () => {
  expect(await isRegistered(preregisteredVoter, true)).toBe('Preregistered')
})
test('Alloy Removed Voter', async () => {
  expect(await isRegistered(removedVoter, true)).toBe('Removed')
})
test('Alloy Challenged Voter', async () => {
  expect(await isRegistered(challengedVoter, true)).toBe('Challenged')
})
