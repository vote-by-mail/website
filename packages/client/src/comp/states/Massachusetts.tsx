import React from 'react'

import Select from 'muicss/lib/react/select'
import { BaseInput } from '../util/Input'

import { MassachusettsInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { useControlRef } from '../util/ControlRef'

const massachusettsPrimary = process.env.REACT_APP_MASSACHUSETTS_PRIMARY

export const Massachusetts = () => {
  const partyRef = useControlRef<Select>()
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<MassachusettsInfo> | null => {
    const partyData = massachusettsPrimary ? partyRef.value() : null

    return {
      ...baseInfo,
      state: 'Massachusetts',
      partyData,
    }
  }

  return <SignatureBase<MassachusettsInfo>enrichValues={enrichValues}>
    {massachusettsPrimary && <>
      If you are interested in voting in the Massachusetts <b>state</b> primary, please designate a Party:
      <BaseInput
        id='partyData'
        ref={partyRef}
        label='State Primary Party'
        required={false}
      />
    </>}
  </SignatureBase>
}
