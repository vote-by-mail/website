import { Letter } from '.'
import { BaseInfo, ContactMethod, ImplementedState, StateInfo, toContactMethod, fullName } from '../../common'
import { getContact, getFirstContact } from '../contact'
import { safeReadFileSync, staticDir } from '../util'

const loadBase64 = (filename: string) => {
  return safeReadFileSync(staticDir(`tests/${filename}`)).toString('base64')
}

const nameParts = {
  first: 'George',
  middle: 'Ford',
  last: 'Washington',
  suffix: 'Jr.',
}
const name = fullName(nameParts)

const baseStateInfo: Omit<BaseInfo, 'contact'> = {
  state: 'Virginia',
  name,
  nameParts,
  email: 'george.washington@gmail.com',
  phone: '+1 (234)-567-8901',
  birthdate: '04/01/1756',
  uspsAddress: '35 Mount Vernon St Apt 3C, Vernon, NJ 00000',
  county: 'Fairfax',
  city: 'Fairfax',
  oid: 'default',
  latLong: [0, 0],
  address: {
    queryAddr: '35 Mount Vernon St Apt 3C, Vernon, NJ 00000',
    fullAddr: '35 Mount Vernon St Apt 3C, Vernon, NJ 00000',
    streetNumber: '35',
    street: 'Mount Vernon St',
    unit: 'Apt 3C',
    city: 'Vernon',
    postcode: '01234',
    state: 'New Jersey',
    stateAbbr: 'NJ',
    country: 'USA',
    county: 'County',
  }
}

const signature = 'data:image/png;base64,' + loadBase64('signature.png')
const idPhoto = 'data:image/jpg;base64,' + loadBase64('idPhoto.jpg')

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> =
  T extends Record<K, V> ? T : never

type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> =
  { [V in T[K]]: DiscriminateUnion<T, K, V> }

type StateInfoRecord = MapDiscriminatedUnion<StateInfo, 'state'>

const getSampleStateInfo = async (): Promise<StateInfoRecord> => {
  const commonStateInfo = async <S extends ImplementedState>(state: S) => ({
    ...baseStateInfo,
    contact: await getFirstContact(state),
    state
  })

  return {
    'Wisconsin': {
      ...await commonStateInfo('Wisconsin'),
      idPhoto,
    },
    'Nevada': {
      ...await commonStateInfo('Nevada'),
      signature,
      idPhoto,
    },
    'Arizona': {
      ...await commonStateInfo('Arizona'),
      idType: 'Arizona License Number',
      idData: '1234',
      party: 'Non-Partisan',
    },
    'Kansas': {
      ...await commonStateInfo('Kansas'),
      signature,
      idType: 'Driver\'s License Number',
      idNumber: '42534',
      idPhoto: undefined
    },
    'New Hampshire': {
      ...await commonStateInfo('New Hampshire'),
      signature,
      primaryParty: 'Republican Party',
    },
    'North Carolina': {
      ...await commonStateInfo('North Carolina'),
      signature,
      idType: 'North Carolina License Number',
      idData: '47826834534597',
      dateMoved: '10/01/2020',
    },
    'Minnesota': {
      ...await commonStateInfo('Minnesota'),
      signature,
      idType: 'Minnesota Issued Driver\'s License or ID Card',
      idData: '47826834534597',
    },
    'Massachusetts': {
      ...await commonStateInfo('Massachusetts'),
      signature,
      partyData: 'Federalist Party',
    },
    'Virginia': {
      ...await commonStateInfo('Virginia'),
      signature,
      last4DigitsOfSsn: '1234',
    },
    'Florida': {
      ...await commonStateInfo('Florida'),
      signature
    },
    'Maine': {
        ...await commonStateInfo('Maine'),
        signature
    },
    'Georgia': {
        ...await commonStateInfo('Georgia'),
        signature
    },
    'Maryland': {
        ...await commonStateInfo('Maryland'),
        signature
    },
    'Michigan': {
        ...await commonStateInfo('Michigan'),
        signature
    },
    'Nebraska': {
        ...await commonStateInfo('Nebraska'),
        signature
    },
    'New York': {
        ...await commonStateInfo('New York'),
        signature
    },
    'Wyoming': {
        ...await commonStateInfo('Wyoming'),
        signature
    },
    'Oklahoma': {
        ...await commonStateInfo('Oklahoma'),
        signature
    },
  }
}

const stateInfoRecord = getSampleStateInfo()

export const sampleStateInfo = async <S extends ImplementedState>(state: S): Promise<StateInfoRecord[S]> => {
  return (await stateInfoRecord)[state]
}

export const sampleMethod: ContactMethod = {
  stateMethod: 'fax-email',
  emails: ['official@elections.gov'],
  faxes: [],
}

export const sampleLetter = async (state: ImplementedState, key?: string): Promise<Letter | null> => {
  const contact = await (key ? getContact(state, key) : getFirstContact(state))
  if (!contact) return null

  const method = toContactMethod({...contact, state})

  // generate sample info
  const info = await sampleStateInfo(state)
  const confirmationId = '#sampleId1234'

  if (!method) return null

  return new Letter(info, method, confirmationId)
}
