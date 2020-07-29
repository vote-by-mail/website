import { cacheIsRegistered } from './alloy'
import { RegistrationArgs, RegistrationStatus } from '../common'
import { testEach } from './utilTests'


const alloyMock = process.env.ALLOY_MOCK

type RegistrationArgsWithStatus = RegistrationArgs & { status: RegistrationStatus }

const mockVoter = (voter: RegistrationArgsWithStatus): RegistrationArgsWithStatus => ({
  ...voter,
  firstName: !alloyMock ? voter.firstName : voter.status,
  lastName: !alloyMock ? voter.lastName : 'Voter',
})

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started
const voters: RegistrationArgsWithStatus[] = [
  mockVoter({
    status: 'Active',
    firstName: 'Terrence',
    lastName: 'Brown',
    birthdate: '1963-05-05',
    stateAbbr: 'DC', city: 'Washington', postcode: '20020',
    street: 'Pecan Acres Ln', streetNumber: '2969',
  }), mockVoter({
    status: 'Inactive',
    firstName: 'Mia',
    lastName: 'Jackson',
    birthdate: '1996-12-21',
    stateAbbr: 'DE', city: 'Bear', postcode: '19701',
    street: 'Oak Lawn Ave', streetNumber: '1067',
  }), mockVoter({
    status: 'Not Found',
    firstName: 'Brandie',
    lastName: 'Nguyen',
    birthdate: '1946-12-11',
    stateAbbr: 'AK', city: 'Wasilla', postcode: '99654',
    streetNumber: '9015', street: 'Fairview St',
  }), mockVoter({
    status: 'Cancelled',
    firstName: 'Peggy',
    lastName: 'Lee',
    birthdate: '1993-11-26',
    stateAbbr: 'AZ', city: 'Tucson', postcode: '85718',
    streetNumber: '5737', street: 'Homestead Rd',
  }), mockVoter({
    status: 'Purged',
    firstName: 'Rebecca',
    lastName: 'Jones',
    birthdate: '1946-12-22',
    stateAbbr: 'CT', city: 'Vernon Rockville', postcode: '06066',
    streetNumber: '8135', street: 'Woodland St',
  }), mockVoter({
    status: 'Not Reported',
    firstName: 'Catherine',
    lastName: 'Medina',
    birthdate: '1977-03-01',
    stateAbbr: 'IN', city: 'Brownsburg', postcode: '46112',
    streetNumber: '7438', street: 'W Sherman Dr',
  }), mockVoter({
    status: 'Pending',
    firstName: 'Cecil',
    lastName: 'Flores',
    birthdate: '1979-10-13',
    stateAbbr: 'IA', city: 'Ankeny', postcode: '50023',
    streetNumber: '1343', street: 'Smokey Ln',
  }), mockVoter({
    status: 'Provisional',
    firstName: 'Rhonda',
    lastName: 'Jordan',
    birthdate: '1992-11-15',
    stateAbbr: 'MT', city: 'Butte', postcode: '59701',
    streetNumber: '4498', street: 'Northaven Rd',
  }), mockVoter({
    status: 'Preregistered',
    firstName: 'Guy',
    lastName: 'Graves',
    birthdate: '2003-06-01',
    stateAbbr: 'NY', city: 'Massapequa Park', postcode: '11762',
    streetNumber: '5851', street: 'W Belt Line Rd',
  }), mockVoter({
    status: 'Removed',
    firstName: 'George',
    lastName: 'Woods',
    birthdate: '1990-07-30',
    stateAbbr: 'NC', city: 'Elizabeth City', postcode: '27909',
    streetNumber: '1101', street: 'Karen Dr',
  }), mockVoter({
    status: 'Challenged',
    firstName: 'Diana',
    lastName: 'Washington',
    birthdate: '1970-08-24',
    stateAbbr: 'VT', city: 'Ascutney', postcode: '05030',
    streetNumber: '6117', street: 'Paddock Way',
  })
]

testEach(voters)('Alloy %s Voter', async (voter) => {
  expect(await cacheIsRegistered(voter)).toBe(voter.status)
})
