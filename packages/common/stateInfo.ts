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
  'Kansas',
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
  'North Dakota',
  'Oklahoma',
  'Virginia',
  'West Virginia',
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
  'Kansas': 'both',
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
  'North Dakota': 'both',
  'Oklahoma': 'both',
  'Virginia': 'both',
  'West Virginia': 'both',
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

export const arizonaIdentityType = ['Arizona License Number', 'Last 4 numbers of SSN', 'Place of Birth'] as const
export type ArizonaIdentityType = (typeof arizonaIdentityType)[number]

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

export interface GeorgiaInfo extends _Id, SignatureBaseInfo {
  // mailingAddress must be in a different county
  // https://sos.ga.gov/admin/uploads/Absentee_Voting_A_Guide_for_Registered_Voters_2017.pdf
  // Must specify type of election (presidential preference primary, general primary, primary runoff, municipal, municipal runoff, special, general, general runoff)
  state: 'Georgia'
  party?: GeorgiaParty // Name of party ballot being requested (for primaries)
}

export const kansasIdentityType = ['Driver\'s License Number', 'Copy of Photo ID'] as const
export type KansasIdentityType = (typeof kansasIdentityType)[number]
export const isKansasIdentity = (x: string | null): x is KansasIdentityType => kansasIdentityType.includes(x as KansasIdentityType)

export interface KansasInfo extends _Id, SignatureBaseInfo {
  state: 'Kansas'
  idType: KansasIdentityType
  idNumber?: string
  idPhoto?: string
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

export interface NewHampshireInfo extends _Id, SignatureBaseInfo {
  state: 'New Hampshire'
  primaryParty?: NewHampshirePrimaryParty
}

export interface NewYorkInfo extends _Id, BaseInfo {
  state: 'New York'
}

export const northCarolinaIdentityType = ['Last 4 numbers of SSN', 'North Carolina License Number'] as const
export type NorthCarolinaIdentityType = (typeof northCarolinaIdentityType)[number]

export interface NorthCarolinaInfo extends _Id, SignatureBaseInfo {
  state: 'North Carolina'
  idType: NorthCarolinaIdentityType
  idData: string
  dateMoved?: string
}

export const northDakotaIdentityType = ['North Dakota License Number', 'Non Driver ID', 'Tribal ID Number'] as const
export type NorthDakotaIdentityType = (typeof northDakotaIdentityType)[number]
export const isNorthDakotaIdentity = (x: string | null): x is NorthDakotaIdentityType => northDakotaIdentityType.includes(x as NorthDakotaIdentityType)

export const northDakotaElectionType = ['Primary', 'General', 'Both', 'City', 'School', 'Special'] as const
export type NorthDakotaElectionType = (typeof northDakotaElectionType)[number]
export const isNorthDakotaElectionType = (x: string | null): x is NorthDakotaElectionType => northDakotaElectionType.includes(x as NorthDakotaElectionType)

export interface NorthDakotaInfo extends _Id, SignatureBaseInfo {
  state: 'North Dakota'
  electionType: NorthDakotaElectionType // one of these options must be selected
  idType: NorthDakotaIdentityType // only handling case where an applicant has an ID number
  idNumber: string
}

export interface OklahomaInfo extends _Id, SignatureBaseInfo {
  state: 'Oklahoma'
}

export interface VirginiaInfo extends _Id, SignatureBaseInfo {
  state: 'Virginia'
  last4DigitsOfSsn: string
}

export const westVirginiaParty = ['Democratic Party', 'Republican Party', 'Mountain'] as const
export type WestVirginiaParty = (typeof westVirginiaParty)[number]

export const westVirginiaElectionLevel = ['Federal/State/County', 'City/Town'] as const
export type WestVirginiaElectionLevel = (typeof westVirginiaElectionLevel)[number]

export const westVirginiaElectionType = ['Primary', 'General', 'Special'] as const
export type WestVirginiaElectionType = (typeof westVirginiaElectionType)[number]

export interface WestVirginiaInfo extends _Id, SignatureBaseInfo {
  // Must specify election (federal/state/county or city/town) and type of election (primary, general, special)
  state: 'West Virginia'
  party?: WestVirginiaParty // Name of party ballot being requested (for primaries)
  election: WestVirginiaElectionLevel // The election the user would like to absentee vote in
  electionType: WestVirginiaElectionType // The type of election the user would like to absentee vote in
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
  | KansasInfo
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
  | NorthDakotaInfo
  | OklahomaInfo
  | VirginiaInfo
  | WestVirginiaInfo
  | WisconsinInfo
  | WyomingInfo
)
