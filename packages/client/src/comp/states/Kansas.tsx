import React from 'react'

import Select from 'muicss/lib/react/select'
import { BaseInput } from '../util/Input'

import { KansasInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { useControlRef } from '../util/ControlRef'

export const Kansas = () => {
  const idRef = useControlRef<Select>()
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<KansasInfo> | null => {
    const idData = ''
    const idType = 'Number'

    return {
      ...baseInfo,
      state: 'Kansas',
      idType,
      idData,
    }
  }

return <SignatureBase<KansasInfo>enrichValues={enrichValues} >
  Current Kansas driver&apos;s license number or nondriver&apos;s identification card number:
  <BaseInput
        id='idData'
        ref={idRef}
        label='Identification Number'
        required={false}
      />
</SignatureBase>

}
