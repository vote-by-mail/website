import React from 'react'

import Select from 'muicss/lib/react/select'
import { BaseInput } from '../util/Input'

import { KansasInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { useControlRef } from '../util/ControlRef'
import { TogglableDropdown } from '../util/TogglableDropdown'

const options = {
  driverId: 'Driver\'s license number',
  nonDriverId: 'Identification Number',
  none: 'None',
} as const

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

  return <SignatureBase<KansasInfo>enrichValues={enrichValues}>
    <TogglableDropdown
      defaultValue={options.driverId}
      label='Method of identification:'
      style={{ marginTop: 40 }}
      options={[
        options.driverId,
        options.nonDriverId,
        options.none,
      ]}
    >{
      (selected: string) => {
        if (selected === 'None') return null
        return <BaseInput
          id='idData'
          label={selected}
          required={true}
          ref={idRef}
        />
      }
    }</TogglableDropdown>
  </SignatureBase>
}
