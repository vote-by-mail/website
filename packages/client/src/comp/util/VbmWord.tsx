import React from 'react'
import { useAppHistory } from "../../lib/path"
import { AddressContainer } from '../../lib/unstated'
import { State, getState } from '../../common'

type VbmNoun =
  | 'absentee voting'
  | 'voting by mail'
  | 'early voting'

type Kind = 'adjective'
  | 'ballot'
  | 'noun'
  | 'verb'

const nounContent = (state: State | null): VbmNoun => {
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

const content = (state: State | null, kind: Kind): string => {
  const noun = nounContent(state)
  switch (kind) {
    case 'noun': {
      return noun
    }
    case 'ballot': {
      switch(noun) {
        case 'absentee voting': return 'an absentee ballot'
        case 'voting by mail': return 'a vote-by-mail ballot'
        case 'early voting': return 'an early-voting ballot'
      }
    }
    // eslint-disable-next-line no-fallthrough
    case 'adjective': {
      switch(noun) {
        case 'absentee voting': return 'absentee-ballot'
        case 'voting by mail': return 'vote-by-mail'
        case 'early voting': return 'early-voting'
      }
    }
    // eslint-disable-next-line no-fallthrough
    case 'verb': {
      switch(noun) {
        case 'absentee voting': return 'vote absentee'
        case 'voting by mail': return 'vote by mail'
        case 'early voting': return 'vote early'
      }
    }
  }
}

/**
 * Renders the state defined word for VBM Nouns/Ballots/Adjectives/Verbs
 */
const VbmWord: React.FC<{ kind: Kind }> = ({kind}) => {
  const { path } = useAppHistory()
  const { locale } = AddressContainer.useContainer()

  const state = locale?.state ?? (
    (path?.type === 'address' || path?.type === 'state')
      ? getState(path.state) ?? null
      : null
  )

  return <>{content(state, kind)}</>
}

export const VbmNoun = () => <VbmWord kind='noun'/>
export const VbmAdjective = () => <VbmWord kind='adjective'/>
export const VbmBallot = () => <VbmWord kind='ballot'/>
export const VbmVerb = () => <VbmWord kind='verb'/>
