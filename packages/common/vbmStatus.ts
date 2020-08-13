import { State } from './states'
import { isImplementedState } from './stateInfo'
import { getStatePortal } from './statePortal'

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Statuses {
  export interface Automatic { status: 'Automatic' }
  export interface Mail { status: "Mail", infoUrl: string }  // Must apply by mail
  export interface VbmApp { status: "VbmApp" }  // Works with our app
  export interface VoteDotOrg { status: 'Vote.org' }
  export interface Website { status: "Website", regUrl: string, infoUrl: string }  // Can apply via state website
}

export type Status = (
  | Statuses.Automatic
  | Statuses.Mail
  | Statuses.VbmApp
  | Statuses.VoteDotOrg
  | Statuses.Website
)

export const vbmStatus = (state: State): Status => {
  if (state === 'North Carolina') {
    return { status: 'Vote.org' }
  }

  if (isImplementedState(state)) {
    return { status: "VbmApp" }
  }

  const electionPortal = getStatePortal(state)
  if (electionPortal) {
    const { regUrl, infoUrl } = electionPortal
    return { status: 'Website', regUrl, infoUrl }
  }

  return { status: 'Vote.org' }
}
