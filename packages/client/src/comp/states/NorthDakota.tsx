import React from 'react'

import { useControlRef } from '../util/ControlRef'
import { TogglableDropdown } from '../util/TogglableDropdown'
import { BaseInput } from '../util/Input'

import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { NorthDakotaInfo, NorthDakotaIdentityType, northDakotaIdentityType, northDakotaElectionType, isNorthDakotaElectionType } from '../../common'

import Input from 'muicss/lib/react/input'
import Select from 'muicss/lib/react/select'
import Option from 'muicss/lib/react/option'

export const NorthDakota = () => {
    const electionTypeRef = useControlRef<Input>()
    const [option, setOption] = React.useState<NorthDakotaIdentityType>(northDakotaIdentityType[0])
    const [idNumber, setIdNumber] = React.useState<string>()

    const enrichValues = (baseInfo: StatelessInfo): NoSignature<NorthDakotaInfo> | null => {
        const electionType: string | null = electionTypeRef.value()
        if (!isNorthDakotaElectionType(electionType)) return null
        if (idNumber === undefined) return null
        return {
            ...baseInfo,
            state: 'North Dakota',
            electionType,
            idType: option,
            idNumber 
        }
    }

    return <SignatureBase<NorthDakotaInfo>enrichValues={enrichValues}>
    <TogglableDropdown<typeof northDakotaIdentityType>
      label='Identification Method:'
      style={{ marginTop: 40 }}
      options={northDakotaIdentityType}
      value={option}
      onChange={value => {
        setOption(value)
      }}
    >{(option) => {
      switch (option) {
        default: return <BaseInput
          id='idData'
          label={option}
          required={true}
          value={idNumber}
          onChange={e => setIdNumber(e.currentTarget.value)}
        />
      }
    }}
    </TogglableDropdown>
    <Select ref={electionTypeRef} label = 'Election Type for Mail in Ballot' defaultValue='Select' {...{required: true}}>
      <Option key={0} hidden={true}/>
      {[...northDakotaElectionType].sort().map((value, key) => {
        return <Option value={value} key={key+1} label={value}/>
      })}
    </Select>
  </SignatureBase>
}