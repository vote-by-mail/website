import React from 'react'

import { Select } from '../util/Select'
import { MinnesotaInfo, minnesotaIdentityType, MinnesotaIdentityType } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { BaseInput } from '../util/Input'

export const Minnesota = () => {
  const [ idType, setIdType ] = React.useState<MinnesotaIdentityType>(minnesotaIdentityType[0])
  const [ idData, setIdData ] = React.useState<string>('')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<MinnesotaInfo> | null => {
    if (!idData) return null

    return {
      ...baseInfo,
      state: 'Minnesota',
      idType,
      idData,
    }
  }

  return <SignatureBase<MinnesotaInfo>enrichValues={enrichValues}>
    <p>Minnesota requires voters to confirm their identify using one of the following types of identification</p>
    <Select
      label='Identification Type'
      value={idType}
      options={[...minnesotaIdentityType]}
      onChange={v => setIdType(v)}
      {...{required: true}}
    />
    <p>Enter the relevant information based on your choice above.  If &apos;None&apos;
      please confirm by typing &apos;None&apos;:
    </p>
    <BaseInput
      id='identityData'
      label='Identity Information'
      value={idData}
      onChange={e => setIdData(e.currentTarget.value)}
      required={true}
      // HTML patterns are never case insensitive, manually creating a regexp
      // that allows users to ignore case here
      pattern={idType === 'None' ? '^(\\s*)(N|n)(O|o)(N|n)(E|e)(\\s*)$' : undefined}
    />
  </SignatureBase>
}
