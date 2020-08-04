import React from 'react'
import { useAppHistory } from "../../lib/path"
import { AddressContainer } from '../../lib/unstated'

type VbmNoun =
  | 'absentee voting'
  | 'early voting'
  | 'voting by mail'

/**
 * Renders the state defined word for VBM Nouns/Ballots/Adjectives/Verbs
 *
 * Defaults to Nouns, to change this use the appropriate prop, i.e. `adjective`,
 * `ballot`, `noun`, or `verb`.
 *
 * Possible values are:
 *
 * * noun: `absentee voting`, `voting by mail`, `early voting`,
 * * ballot: `absentee ballot`, `vote-by-mail ballot`, `early voting ballot`,
 * * adjective: `absentee ballot`, `vote-by-mail`, `early voting ballot`,
 * * verb: `vote absentee`, `vote by mail`, `vote early`,
 */
export const VbmWording: React.FC<
  // Warns everyone when trying to use <VbmWording/> with more than one
  // prop since these cases could potentially be shipped unnoticed to production.
  | { adjective: true, ballot?: never, noun?: never, verb?: never }
  | { adjective?: never, ballot: true, noun?: never, verb?: never }
  | { adjective?: never, ballot?: never, noun: true, verb?: never }
  | { adjective?: never, ballot?: never, noun?: never, verb: true }
> = ({ adjective, ballot, noun, verb }) => {
  const { path } = useAppHistory()
  const { locale } = AddressContainer.useContainer()

  const state = locale?.state ?? (
    (path?.type === 'address' || path?.type === 'state')
      ? path?.state
      : 'Default'
  )
  const renderDefault = !adjective && !ballot && !noun && !verb

  const nounContent = (): VbmNoun => {
    switch (state) {
      case 'Arizona': return 'voting by mail'
      case 'Florida': return 'voting by mail'
      case 'Georgia': return 'absentee voting'
      case 'Maine': return 'absentee voting'
      case 'Maryland': return 'absentee voting'
      case 'Massachusetts': return 'absentee voting'
      case 'Michigan': return 'absentee voting'
      case 'Minnesota': return 'absentee voting'
      case 'Nebraska': return 'early voting'
      case 'Nevada': return 'absentee voting'
      case 'New Hampshire': return 'absentee voting'
      case 'New York': return 'absentee voting'
      case 'North Carolina': return 'absentee voting'
      case 'Oklahoma': return 'absentee voting'
      case 'Wisconsin': return 'absentee voting'
      case 'Wyoming': return 'absentee voting'
      default: return 'voting by mail'
    }
  }

  if (renderDefault) {
    return <>{nounContent()}</>
  }

  if (adjective) {
    switch (nounContent()) {
      case 'absentee voting': return <>absentee ballot</>
    }
  }

  if (ballot) {
    switch (nounContent()) {
      case 'absentee voting': return <>absentee ballot</>
      case 'early voting': return <>early voting ballot</>
      default: return <>vote-by-mail ballot</>
    }
  }

  switch (nounContent()) {
    case 'absentee voting': return <>vote absentee</>
    case 'early voting': return <>vote early</>
    default: return <>vote by mail</>
  }
}
