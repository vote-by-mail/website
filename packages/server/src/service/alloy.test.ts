import { isRegistered } from './alloy'
import { RegistrationArgs } from '../common'
import { testEach } from './utilTests'

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started

const alloyMock = process.env.ALLOY_MOCK

const voters = [
  {
    status: 'Active',
    firstName: alloyMock ? 'Active' : 'Terrence',
    lastName: alloyMock ? 'Voter' : 'Brown',
    birthdate: '1963-05-05',
    address: {
      stateAbbr: 'DC', city: 'Washington', postcode: '20020',
      street: 'Pecan Acres Ln', streetNumber: '2969',
    }
  }, {
    status: 'Inactive',
    firstName: alloyMock ? 'Inactive' : 'Mia',
    lastName: alloyMock ? 'Voter' : 'Jackson',
    birthdate: '1996-12-21',
    address: {
      stateAbbr: 'DE', city: 'Bear', postcode: '19701',
      street: 'Oak Lawn Ave', streetNumber: '1067',
    }
  }, {
    status: 'Not Found',
    firstName: alloyMock ? 'Not Found' : 'Brandie',
    lastName: alloyMock ? 'Voter' : 'Nguyen',
    birthdate: '1946-12-11',
    address: {
      stateAbbr: 'AK', city: 'Wasilla', postcode: '99654',
      streetNumber: '9015', street: 'Fairview St',
    },
  }, {
    status: 'Cancelled',
    firstName: alloyMock ? 'Cancelled' : 'Peggy',
    lastName: alloyMock ? 'Voter' : 'Lee',
    birthdate: '1993-11-26',
    address: {
      stateAbbr: 'AZ', city: 'Tucson', postcode: '85718',
      streetNumber: '5737', street: 'Homestead Rd',
    },
  }, {
    status: 'Purged',
    firstName: alloyMock ? 'Purged' : 'Rebecca',
    lastName: alloyMock ? 'Voter' : 'Jones',
    birthdate: '1946-12-22',
    address: {
      stateAbbr: 'CT', city: 'Vernon Rockville', postcode: '06066',
      streetNumber: '8135', street: 'Woodland St',
    },
  }, {
    status: 'Not Reported',
    firstName: alloyMock ? 'Not Reported' : 'Catherine',
    lastName: alloyMock ? 'Voter' : 'Medina',
    birthdate: '1977-03-01',
    address: {
      stateAbbr: 'IN', city: 'Brownsburg', postcode: '46112',
      streetNumber: '7438', street: 'W Sherman Dr',
    },
  }, {
    status: 'Pending',
    firstName: alloyMock ? 'Pending' : 'Cecil',
    lastName: alloyMock ? 'Voter' : 'Flores',
    birthdate: '1979-10-13',
    address: {
      stateAbbr: 'IA', city: 'Ankeny', postcode: '50023',
      streetNumber: '1343', street: 'Smokey Ln',
    },
  }, {
    status: 'Provisional',
    firstName: alloyMock ? 'Provisional' : 'Rhonda',
    lastName: alloyMock ? 'Voter' : 'Jordan',
    birthdate: '1992-11-15',
    address: {
      stateAbbr: 'MT', city: 'Butte', postcode: '59701',
      streetNumber: '4498', street: 'Northaven Rd',
    },
  }, {
    status: 'Preregistered',
    firstName: alloyMock ? 'Preregistered' : 'Guy',
    lastName: alloyMock ? 'Voter' : 'Graves',
    birthdate: '2003-06-01',
    address: {
      stateAbbr: 'NY', city: 'Massapequa Park', postcode: '11762',
      streetNumber: '5851', street: 'W Belt Line Rd',
    },
  }, {
    status: 'Removed',
    firstName: alloyMock ? 'Removed' : 'George',
    lastName: alloyMock ? 'Voter' : 'Woods',
    birthdate: '1990-07-30',
    address: {
      stateAbbr: 'NC', city: 'Elizabeth City', postcode: '27909',
      streetNumber: '1101', street: 'Karen Dr',
    },
  }, {
    status: 'Challenged',
    firstName: alloyMock ? 'Challenged' : 'Diana',
    lastName: alloyMock ? 'Voter' : 'Washington',
    birthdate: '1970-08-24',
    address: {
      stateAbbr: 'VT', city: 'Ascutney', postcode: '05030',
      streetNumber: '6117', street: 'Paddock Way',
    },
  }
]

testEach(voters)('Alloy %s Voter', async (voter) => {
  expect(await isRegistered(voter as unknown as RegistrationArgs, true)).toBe(voter.status)
})
