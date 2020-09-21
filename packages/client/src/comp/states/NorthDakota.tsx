import React from 'react'

import { Select } from '../util/Select'
import { BaseInput } from '../util/Input'

import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { NorthDakotaInfo, NorthDakotaIdentityType, northDakotaIdentityType, northDakotaElectionType, NorthDakotaElectionType } from '../../common'

export const NorthDakota = () => {
  const [electionType, setElectionType] = React.useState<NorthDakotaElectionType>('Both')
  const [idType, setIdType] = React.useState<NorthDakotaIdentityType>('Non Driver ID')
  const [idNumber, setIdNumber] = React.useState<string>('')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<NorthDakotaInfo> | null => {
    if (!idNumber) return null
    return {
      ...baseInfo,
      state: 'North Dakota',
      electionType,
      idType,
      idNumber
    }
  }

  return <SignatureBase<NorthDakotaInfo> enrichValues={enrichValues}>
    <Select
      label='Identification Method:'
      style={{ marginTop: 40 }}
      options={northDakotaIdentityType}
      value={idType}
      onChange={value => setIdType(value)}
    />
    <BaseInput
      id='idData'
      label={idType}
      required={true}
      value={idNumber}
      onChange={e => setIdNumber(e.currentTarget.value)}
    />
    <Select
      label='Election Type for Mail in Ballot'
      options={northDakotaElectionType}
      value={electionType}
      onChange={e => setElectionType(e)}
    />
  </SignatureBase>
}
