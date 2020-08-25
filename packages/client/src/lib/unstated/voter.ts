import React from 'react'
import { createContainer } from "unstated-next"
import { Voter, UTM } from '../../common'
import { useDeepMemoize } from './memoize'
import { isIframeEmbedded } from '../util'

const localStorageKey = 'voter-data'

// https://medium.com/@jrcreencia/persisting-redux-state-to-local-storage-f81eb0b90e7e
const loadLocalStorage = (): Partial<Voter> => {
  if (isIframeEmbedded()) return {}

  const serialized = localStorage.getItem(localStorageKey)
  if (serialized === null) return {}
  try {
    return JSON.parse(serialized) as Partial<Voter>
  } catch (e) {
    return {}
  }
}

const saveLocalStorage = (userData: Voter): void => {
  if (isIframeEmbedded()) { return }
  const serialized = JSON.stringify(userData)
  localStorage.setItem(localStorageKey, serialized)
}

const randomUserId = () => {
  // https://gist.github.com/6174/6062387
  return Math.random().toString(36).substring(2, 15)
}

const defaultInitialState = { uid: randomUserId() }

/** Set initial state without overwriting data in localStorage */
const useVoterContainer = (initialState: Voter = defaultInitialState) => {
  const existingVoter = loadLocalStorage()
  const [voter, setVoter] = React.useState<Voter>({
    ...(initialState ?? {}),
    ...existingVoter
  })
  const voterMemo = useDeepMemoize(voter)

  /** Non-overwriting update of user data */
  const conservativeUpdateVoter = React.useCallback((utm: UTM) => {
    const newVoter = {...utm, ...voterMemo}
    if (!isIframeEmbedded()) {
      saveLocalStorage(newVoter)
      setVoter(newVoter)
    }
  }, [voterMemo])
  return { voter: voterMemo, conservativeUpdateVoter }
}

export const VoterContainer = createContainer(useVoterContainer)
