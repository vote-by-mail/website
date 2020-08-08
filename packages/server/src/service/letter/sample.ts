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
  state: 'Florida',
  name, nameParts,
  email: 'george.washington@gmail.com',
  phone: '+1 (234)-567-8901',
  birthdate: '04/01/1756',
  uspsAddress: '35 Mount Vernon St Apt 3C, Vernon, NJ 00000',
  mailingAddress: '55 Fifth Avenue Apt 10F, New York, NY 34562',
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
    postcode: '00000',
    state: 'New Jersey',
    stateAbbr: 'NJ',
    country: 'USA',
  }
}

const signature = 'data:image/png;base64,' + loadBase64('signature.png')
const idPhoto = 'data:image/jpg;base64,' + loadBase64('idPhoto.jpg')

export const sampleStateInfo = async (state: ImplementedState): Promise<StateInfo> => {
  const commonStateInfo = {
    ...baseStateInfo,
    contact: await getFirstContact(state)
  }

  switch(state) {
    case 'Wisconsin': return {
      ...commonStateInfo,
      idPhoto,
      state,
    }
    case 'Nevada': return {
      ...commonStateInfo,
      signature,
      idPhoto,
      state,
    }

    case 'Arizona': return {
      ...commonStateInfo,
      idType: 'Arizona License Number',
      idData: '1234',
      party: 'Non-Partisan',
      state,
    }

    case 'New Hampshire': return {
      ...commonStateInfo,
      signature,
      primaryParty: 'No Primary',
      state,
    }

    case 'North Carolina': return {
      ...commonStateInfo,
      signature,
      idType: 'North Carolina License Number',
      idData: '47826834534597',
      dateMoved: '10/01/2020',
      state,
    }

    case 'Minnesota': return {
      ...commonStateInfo,
      signature,
      idType: 'Minnesota Issued Driver\'s License or ID Card',
      idData: '47826834534597',
      state,
    }

    case 'Massachusetts': return {
      ...commonStateInfo,
      signature,
      partyData: 'Federalist Party',
      state,
    }

    default: return {
      ...commonStateInfo,
      signature,
      state,
    }
  }
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
