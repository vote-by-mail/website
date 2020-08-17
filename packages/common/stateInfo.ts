import { _Id } from './util'
import { Locale } from './locale'
import { ContactData } from './contact'
import { ExtendsState } from './states'
import { Address, AddressInputParts } from './address'
import { RegistrationStatus } from './voter'
import { NameParts } from './nameParts'

// States for which we now support
export const implementedStates = [
  'Arizona',
  'Florida',
  'Georgia',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New York',
  'North Carolina',
  'Oklahoma',
  'Virginia',
  'Wisconsin',
  'Wyoming',
] as const
export type ImplementedState = ExtendsState<(typeof implementedStates)[number]>
// We can't use set here because it seems Google Translator deplays the DOM loading and therefore the resulting set will be empty
export const isImplementedState = (x: string): x is ImplementedState => implementedStates.some(state => state === x)
export type ImplementedStateField = {state: ImplementedState}
export const isImplementedLocale = (l: Locale): l is Locale<ImplementedState> => implementedStates.some(state => state === l.state)

export type SignatureType = 'canvas' | 'upload'

type StateSignatureType = Record<ImplementedState, 'both' | SignatureType>

const stateSignatureType: StateSignatureType = {
  'Arizona': 'both',
  'Florida': 'both',
  'Georgia': 'both',
  'Maine': 'both',
  'Maryland': 'both',
  'Massachusetts': 'both',
  'Michigan': 'both',
  'Minnesota': 'both',
  'Nebraska': 'upload',
  'Nevada': 'both',
  'New Hampshire': 'upload',
  'New York': 'both',
  'North Carolina': 'both',
  'Oklahoma': 'both',
  'Virginia': 'both',
  'Wisconsin': 'both',
  'Wyoming': 'both',
}

export const eligibleSignatureType = (state: ImplementedState) => {
  return stateSignatureType[state]
}

export interface BaseInfo extends Locale {
  state: ImplementedState
  name: string
  nameParts: NameParts
  email: string
  phone: string
  birthdate: string
  uspsAddress: string
  mailingAddress?: string
  mailingAddressParts?: AddressInputParts
  address: Address
  oid: string
  ip?: string
  userAgent?: string
  idPhoto?: string
  signature?: string
  signatureType?: SignatureType
  contact: ContactData
  alloy?: {
    id?: string
    status: RegistrationStatus | 'Error'
  }
}

interface SignatureBaseInfo extends BaseInfo {
  signature: string
}

export const arizonaParty = ['Democratic Party', 'Republican Party', 'Non-Partisan', 'Green Party (Pima County only)'] as const
export type ArizonaParty = (typeof arizonaParty)[number]
export const isArizonaParty = (x: string | null): x is ArizonaParty => arizonaParty.includes(x as ArizonaParty)

export const arizonaIdentityType = ['Arizona License Number', 'Last 4 numbers of SSN', 'Place of Birth'] as const
export type ArizonaIdentityType = (typeof arizonaIdentityType)[number]
export const isArizonaIdentity = (x: string | null): x is ArizonaIdentityType => arizonaIdentityType.includes(x as ArizonaIdentityType)

export interface ArizonaInfo extends _Id, BaseInfo{
  state: 'Arizona'
  party?: ArizonaParty
  idType: ArizonaIdentityType
  idData: string
}

export interface FloridaInfo extends _Id, SignatureBaseInfo{
  state: 'Florida'
}

export interface MichiganInfo extends _Id, SignatureBaseInfo {
  state: 'Michigan'
  permanentList?: boolean
}

export const georgiaParty = ['Democratic Party', 'Republican Party', 'Non-Partisan'] as const
export type GeorgiaParty = (typeof georgiaParty)[number]
export const isGeorgiaParty = (x: string | null): x is GeorgiaParty => georgiaParty.includes(x as GeorgiaParty)

export interface GeorgiaInfo extends _Id, SignatureBaseInfo {
  // mailingAddress must be in a different county
  // https://sos.ga.gov/admin/uploads/Absentee_Voting_A_Guide_for_Registered_Voters_2017.pdf
  // Must specify type of election (presidential preference primary, general primary, primary runoff, municipal, municipal runoff, special, general, general runoff)
  state: 'Georgia'
  party?: GeorgiaParty // Name of party ballot being requested (for primaries)
}

export interface MaineInfo extends _Id, SignatureBaseInfo {
  state: 'Maine'
}

export interface MarylandInfo extends _Id, SignatureBaseInfo {
  state: 'Maryland'
}

export interface MassachusettsInfo extends _Id, SignatureBaseInfo {
  state: 'Massachusetts'
  partyData: string | null
}

export const minnesotaIdentityType = ['Minnesota Issued Driver\'s License or ID Card', 'Last 4 numbers of SSN', 'None'] as const
export type MinnesotaIdentityType = (typeof minnesotaIdentityType)[number]
export const isMinnesotaIdentity = (x: string | null): x is MinnesotaIdentityType => minnesotaIdentityType.includes(x as MinnesotaIdentityType)

export interface MinnesotaInfo extends _Id, SignatureBaseInfo {
  state: 'Minnesota'
  idType: MinnesotaIdentityType
  idData: string
}

export interface NebraskaInfo extends _Id, SignatureBaseInfo {
  state: 'Nebraska'
}

export interface NevadaInfo extends _Id, SignatureBaseInfo {
  state: 'Nevada'
  idPhoto?: string
}

export const newHampshirePrimaryParty = ['No Primary', 'Democratic Party', 'Republican Party'] as const
export type NewHampshirePrimaryParty = (typeof newHampshirePrimaryParty)[number]
export const isNewHampshirePrimaryParty = (
  x: string | null
): x is NewHampshirePrimaryParty => newHampshirePrimaryParty.includes(x as NewHampshirePrimaryParty)

export interface NewHampshireInfo extends _Id, SignatureBaseInfo {
  state: 'New Hampshire'
  primaryParty?: NewHampshirePrimaryParty
}

export interface NewYorkInfo extends _Id, BaseInfo {
  state: 'New York'
}

export const northCarolinaIdentityType = ['North Carolina License Number', 'Last 4 numbers of SSN'] as const
export type NorthCarolinaIdentityType = (typeof northCarolinaIdentityType)[number]
export const isNorthCarolinaIdentity = (x: string | null): x is NorthCarolinaIdentityType => northCarolinaIdentityType.includes(x as NorthCarolinaIdentityType)

export interface NorthCarolinaInfo extends _Id, SignatureBaseInfo {
  state: 'North Carolina'
  idType: NorthCarolinaIdentityType
  idData: string
  dateMoved?: string
}

export interface OklahomaInfo extends _Id, SignatureBaseInfo {
  state: 'Oklahoma'
}

export interface VirginiaInfo extends _Id, SignatureBaseInfo {
  state: 'Virginia'
  last4DigitsOfSsn: string
}

export interface WisconsinInfo extends _Id, BaseInfo {
  // https://elections.wi.gov/sites/elections.wi.gov/files/2019-02/Faxing%20or%20Emailing%20Absentee%20Ballots.pdf
  // no signature required
  // Wisconsin allows ballots by fax, email, or in-person, but we will stick to mail
  state: 'Wisconsin'
  idPhoto?: string
}

export interface WyomingInfo extends _Id, BaseInfo{
  state: 'Wyoming'
}

export type StateInfo = (
  | ArizonaInfo
  | FloridaInfo
  | GeorgiaInfo
  | MaineInfo
  | MarylandInfo
  | MassachusettsInfo
  | MichiganInfo
  | MinnesotaInfo
  | NebraskaInfo
  | NevadaInfo
  | NewYorkInfo
  | NewHampshireInfo
  | NorthCarolinaInfo
  | OklahomaInfo
  | VirginiaInfo
  | WisconsinInfo
  | WyomingInfo
)
