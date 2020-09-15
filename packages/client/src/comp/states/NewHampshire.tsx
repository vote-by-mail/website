import React from 'react'

import { Select } from '../util/Select'
import { NewHampshireInfo, newHampshirePrimaryParty, primaryEligible, NewHampshirePrimaryParty } from '../../common'
import { SignatureBase } from './Base'

export const NewHampshire = () => {
  const [ primaryParty, setPrimaryParty ] = React.useState<NewHampshirePrimaryParty>(newHampshirePrimaryParty[0])
  const newHampshirePrimary = primaryEligible('New Hampshire')

  return <SignatureBase<NewHampshireInfo>
    enrichValues={(info) => {
      if (newHampshirePrimary) {
        return {
          ...info,
          state: 'New Hampshire',
          primaryParty,
        }
      }
      return {
        ...info,
        state: 'New Hampshire',
      }
    }}
  >
    {newHampshirePrimary &&
      <Select
        label='Party for Primary Ballot'
        options={[...newHampshirePrimaryParty]}
        value={primaryParty}
        onChange={v => setPrimaryParty(v)}
        {...{required: true}}
      />
    }
  </SignatureBase>
}
