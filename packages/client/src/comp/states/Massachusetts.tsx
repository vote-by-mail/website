import React from 'react'

import { BaseInput } from '../util/Input'
import { MassachusettsInfo, primaryEligible } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'

export const Massachusetts = () => {
  const [ party, setParty ] = React.useState<string>('')
  const massachusettsPrimary = primaryEligible('Massachusetts')
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<MassachusettsInfo> | null => {
    if (!party) return null

    return {
      ...baseInfo,
      state: 'Massachusetts',
      partyData: massachusettsPrimary ? party : null,
    }
  }

  return <SignatureBase<MassachusettsInfo>enrichValues={enrichValues}>
    {massachusettsPrimary && <>
      If you are interested in voting in the Massachusetts <b>state</b> primary, please designate a Party:
      <BaseInput
        id='partyData'
        value={party}
        onChange={e => setParty(e.currentTarget.value)}
        label='State Primary Party'
        required={false}
      />
    </>}
  </SignatureBase>
}
