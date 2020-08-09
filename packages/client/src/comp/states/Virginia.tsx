import React from 'react'

import Select from 'muicss/lib/react/select'
import { BaseInput } from '../util/Input'

import { VirginiaInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { useControlRef } from '../util/ControlRef'

export const Virginia = () => {
  const idRef = useControlRef<Select>()
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<VirginiaInfo> | null => {
    const last4DigitsOfSsn = idRef.value()
    if (!last4DigitsOfSsn) return null

    return {
      ...baseInfo,
      state: 'Virginia',
      last4DigitsOfSsn,
    }
  }

return <SignatureBase<VirginiaInfo>enrichValues={enrichValues} >
  <BaseInput
        id='last4DigitsOfSsn'
        ref={idRef}
        label='Last 4 Digits of Social Security Number'
        pattern='\d\d\d\d+'
        required={true}
      />
</SignatureBase>

}