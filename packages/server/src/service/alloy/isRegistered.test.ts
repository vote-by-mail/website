import { cacheIsRegistered, toAlloyDate } from './'
import { RegistrationArgs, RegistrationStatus } from '../../common'


const alloyMock = process.env.ALLOY_MOCK

type RegistrationArgsWithStatus = RegistrationArgs & { status: RegistrationStatus }

const mockVoter = (voter: RegistrationArgsWithStatus): RegistrationArgsWithStatus => ({
  ...voter,
  nameParts : {
    first: !alloyMock ? voter.nameParts.first : voter.status,
    last: !alloyMock ? voter.nameParts.last : 'Voter',
  }
})

// Values taken from https://docs.alloy.us/api/#section/Sandbox/Getting-Started
const voters: RegistrationArgsWithStatus[] = [
  mockVoter({
    status: 'Active',
    nameParts: {
      first: 'Terrence',
      last: 'Brown',
    },
    birthdate: '05/05/1963',
    stateAbbr: 'DC', city: 'Washington', postcode: '20020',
    street: '2969 Pecan Acres Ln',
  }), mockVoter({
    status: 'Inactive',
    nameParts: {
      first: 'Mia',
      last: 'Jackson',
    },
    birthdate: '12/21/1996',
    stateAbbr: 'DE', city: 'Bear', postcode: '19701',
    street: '1067 Oak Lawn Ave',
  }), mockVoter({
    status: 'Not Found',
    nameParts: {
      first: 'Brandie',
      last: 'Nguyen',
    },
    birthdate: '12/11/1946',
    stateAbbr: 'AK', city: 'Wasilla', postcode: '99654',
    street: '9015 Fairview St',
  }), mockVoter({
    status: 'Cancelled',
    nameParts: {
      first: 'Peggy',
      last: 'Lee',
    },
    birthdate: '11/26/1993',
    stateAbbr: 'AZ', city: 'Tucson', postcode: '85718',
    street: '5737 Homestead Rd',
  }), mockVoter({
    status: 'Purged',
    nameParts: {
      first: 'Rebecca',
      last: 'Jones',
    },
    birthdate: '12/22/1946',
    stateAbbr: 'CT', city: 'Vernon Rockville', postcode: '06066',
    street: '8135 Woodland St',
  }), mockVoter({
    status: 'Not Reported',
    nameParts: {
      first: 'Catherine',
      last: 'Medina',
    },
    birthdate: '03/01/1977',
    stateAbbr: 'IN', city: 'Brownsburg', postcode: '46112',
    street: '7438 W Sherman Dr',
  }), mockVoter({
    status: 'Pending',
    nameParts: {
      first: 'Cecil',
      last: 'Flores',
    },
    birthdate: '10/13/1979',
    stateAbbr: 'IA', city: 'Ankeny', postcode: '50023',
    street: '1343 Smokey Ln',
  }), mockVoter({
    status: 'Provisional',
    nameParts: {
      first: 'Rhonda',
      last: 'Jordan',
    },
    birthdate: '11/15/1992',
    stateAbbr: 'MT', city: 'Butte', postcode: '59701',
    street: '4498 Northaven Rd',
  }), mockVoter({
    status: 'Preregistered',
    nameParts: {
      first: 'Guy',
      last: 'Graves',
    },
    birthdate: '06/01/2003',
    stateAbbr: 'NY', city: 'Massapequa Park', postcode: '11762',
    street: '5851 W Belt Line Rd',
  }), mockVoter({
    status: 'Removed',
    nameParts: {
      first: 'George',
      last: 'Woods',
    },
    birthdate: '07/30/1990',
    stateAbbr: 'NC', city: 'Elizabeth City', postcode: '27909',
    street: '1101 Karen Dr',
  }), mockVoter({
    status: 'Challenged',
    nameParts: {
      first: 'Diana',
      last: 'Washington',
    },
    birthdate: '08/24/1970',
    stateAbbr: 'VT', city: 'Ascutney', postcode: '05030',
    street: '6117 Paddock Way',
  })
]

beforeAll(() => jest.setTimeout(10000))

test('Alloy date conversion', () => {
  expect(toAlloyDate('07/31/2020')).toBe('2020-07-31')
  expect(toAlloyDate('02/29/2020')).toBe('2020-02-29')
})

test.each(voters)('Alloy %s Voter', async (voter) => {
  expect((await cacheIsRegistered(voter)).status).toBe(voter.status)
})
