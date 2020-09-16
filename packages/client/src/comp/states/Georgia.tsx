import React from 'react'

import { GeorgiaInfo, georgiaParty, primaryEligible, GeorgiaParty } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'

import { Select } from '../util/Select'

export const Georgia = () => {
  const [ party, setParty ] = React.useState<GeorgiaParty>('Democratic Party')
  const georgiaPrimary = primaryEligible('Georgia')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<GeorgiaInfo> | null => {
    if (georgiaPrimary) {
      return {
        ...baseInfo,
        state: 'Georgia',
        party,
      }
    }
    return {
      ...baseInfo,
      state: 'Georgia',
    }
  }

  if (georgiaPrimary) {
    return <SignatureBase<GeorgiaInfo> enrichValues={enrichValues}>
      <Select
        label='Party for Primary Ballot'
        options={georgiaParty}
        value={party}
        onChange={v => setParty(v)}
      />
    </SignatureBase>
  }
  return <SignatureBase<GeorgiaInfo> enrichValues={enrichValues}/>
}
