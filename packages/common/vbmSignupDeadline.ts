import { ImplementedState } from './stateInfo'
import { State } from './states'

const year = 2020
const deadline = (month: number, day: number) => new Date(year, month-1, day)

type StateDeadline =
  Record<ImplementedState, Date | null>
  & Partial<Record<State, Date | null>>

const vbmSignupDeadline: StateDeadline = {
  Alaska: deadline(8, 8),
  Arizona: deadline(5, 3),
  Connecticut: deadline(8, 4),
  // Delaware Has two deadlines?
  "District of Columbia": deadline(5, 26),
  Florida: deadline(8, 8),
  Georgia: deadline(4, 3),
  Hawaii: deadline(8, 1),
  Indiana: deadline(5, 21),
  Kansas: deadline(7, 28),
  Kentucky: deadline(6, 16),
  Louisiana: deadline(7, 7),
  Maine: deadline(7, 9),
  Maryland: deadline(5, 29),
  Massachusetts: deadline(8, 25),
  Michigan: deadline(7, 31),
  Minnesota: deadline(8, 4),
  Missouri: deadline(7, 22),
  Montana: deadline(6, 1),
  Nebraska: deadline(5, 1),
  Nevada: deadline(5, 5),
  "New Hampshire": deadline(9, 1),
  "New Jersey": deadline(6, 30),
  "New Mexico": deadline(5, 28),
  "New York": deadline(6, 16),
  "North Carolina": null, // Couldn't find
  Ohio: deadline(4, 25),
  Oklahoma: deadline(6, 23),
  "Rhode Island": deadline(8, 18),
  "South Dakota": deadline(6, 1),
  Tennessee: deadline(7, 30),
  Vermont: deadline(8, 4),
  Washington: deadline(7, 28),
  Virginia: deadline(6, 23),
  "West Virginia": deadline(5, 19), 
  Wisconsin: deadline(8, 6),
  Wyoming: deadline(8, 11),
}

export const primaryEligible = (state: keyof (typeof vbmSignupDeadline)) => {
  const deadline = vbmSignupDeadline[state]
  return deadline ? new Date() <= deadline : false
}
