import { isImplementedState } from './stateInfo'

// We don't use Record<StateAbbreviation, State> to avoid type issues on
// getState below
const stateAbbreviations = {
  'AZ': 'Arizona',
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'DC': 'District of Columbia',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
} as const

type KeysOf <R> = R extends Record<infer K, unknown> ? K : never
export type StateAbbreviation = KeysOf<typeof stateAbbreviations>

export const allStates = Object.values(stateAbbreviations)

export type State = (typeof allStates)[number]
// We can't use set here because it seems Google Translator delays the DOM loading and therefore the resulting set will be empty
export const isState = (x: string): x is State => allStates.some(state => state === x)
export type StateField = {state: State}
export type ExtendsState<T extends State> = T extends State ? T : never

const caseInsensitiveStates: Record<string, State> = Object.fromEntries(
  Object.values(stateAbbreviations)
    .map(state => [state.toUpperCase(), state])
)

export const getState = (key: string): State | undefined => {
  const upperKey = key.toUpperCase()
  return stateAbbreviations[upperKey as StateAbbreviation] ?? caseInsensitiveStates[upperKey] ?? undefined
}

export const getImplementedState = (key: string) => {
  const state = getState(key)
  if (!state) return null
  return isImplementedState(state) ? state : null
}


export const getStateAbbr = (value: State): StateAbbreviation | undefined => {
  return (Object.keys(stateAbbreviations) as StateAbbreviation[]).find(
    key => stateAbbreviations[key] === value
  )
}
