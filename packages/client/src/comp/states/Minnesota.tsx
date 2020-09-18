import React from 'react'

import { MinnesotaInfo, minnesotaIdentityType, MinnesotaIdentityType } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { BaseInput } from '../util/Input'
import { TogglableDropdown } from '../util/TogglableDropdown'
import { AppCheckbox } from '../util/Checkbox'

export const Minnesota = () => {
  const [ idType, setIdType ] = React.useState<MinnesotaIdentityType>('Last 4 numbers of SSN')
  const [ idData, setIdData ] = React.useState<string>('')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<MinnesotaInfo> | null => {
    if (!idData && idType !== 'None') return null

    return {
      ...baseInfo,
      state: 'Minnesota',
      idType,
      idData,
    }
  }

  return <SignatureBase<MinnesotaInfo>enrichValues={enrichValues}>
    <p>Minnesota requires voters to confirm their identify using one of the following types of identification</p>
    <TogglableDropdown
      label='Identification Type'
      value={idType}
      options={minnesotaIdentityType}
      onChange={v => setIdType(v)}
    >{(option) => {
      switch (option) {
        case 'Minnesota Issued Driver\'s License or ID Card':
        case 'Last 4 numbers of SSN':
          return <BaseInput
            id='identityData'
            label='Identity Information'
            value={idData}
            onChange={e => setIdData(e.currentTarget.value)}
            required={true}
          />

        case 'None':
          return <AppCheckbox
            label={'I confirm that I do not have a Minnesota-issued driver’s license, Minnesota-issued ID card or a social security number'}
            required={true}
          />
      }
    }}</TogglableDropdown>
  </SignatureBase>
}
