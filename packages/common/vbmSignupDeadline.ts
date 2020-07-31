import { ImplementedState } from './stateInfo'
import { State } from './states'

const year = 2020
const deadline = (month: number, day: number) => new Date(year, month-1, day)

type StateDeadline =
  Record<ImplementedState, Date | null>
  & Partial<Record<State, Date | null>>

const vbmSignupDeadline: StateDeadline = {
  Alabama: null,
  Alaska: deadline(8, 8),
  Arizona: deadline(5, 3),
  Arkansas: null,
  California: null,
  Colorado: null,
  Connecticut: deadline(8, 4),
  // Delaware Has two deadlines?
  "District of Columbia": deadline(5, 26),
  Florida: deadline(8, 8),
  Georgia: deadline(4, 3),
  Hawaii: deadline(8, 1),
  Idaho: null,
  Illinois: null,
  Indiana: deadline(5, 21),
  Iowa: null,
  Kansas: deadline(7, 28),
  Kentucky: deadline(6, 16),
  Louisiana: deadline(7, 7),
  Maine: deadline(7, 9),
  Maryland: deadline(5, 29),
  Massachusetts: deadline(8, 25),
  Michigan: deadline(7, 31),
  Minnesota: deadline(8, 4),
  Mississippi: null,
  Missouri: deadline(7, 22),
  Montana: deadline(6, 1),
  Nebraska: deadline(5, 1),
  Nevada: deadline(5, 5),
  "New Hampshire": deadline(9, 1),
  "New Jersey": deadline(6, 30),
  "New Mexico": deadline(5, 28),
  "New York": deadline(6, 16),
  "North Carolina": null, // Couldn't find
  "North Dakota": null,
  Ohio: deadline(4, 25),
  Oklahoma: deadline(6, 23),
  Oregon: null,
  Pennsylvania: null,
  "Rhode Island": deadline(8, 18),
  "South Carolina": null,
  "South Dakota": deadline(6, 1),
  Tennessee: deadline(7, 30),
  Texas: null,
  Utah: null,
  Vermont: deadline(8, 4),
  Virginia: null,
  Washington: deadline(7, 28),
  "West Virginia": deadline(6, 3),
  Wisconsin: deadline(8, 6),
  Wyoming: deadline(8, 11),
}

export const primaryEligible = (state: keyof (typeof vbmSignupDeadline)) => {
  const deadline = vbmSignupDeadline[state]
  return deadline ? new Date() <= deadline : false
}
