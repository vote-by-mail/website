import React from 'react'

import { Select } from '../util/Select'

import { NorthCarolinaInfo, northCarolinaIdentityType, NorthCarolinaIdentityType} from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { BaseInput, DateInput } from '../util/Input'
import { Togglable } from '../util/Togglable'

export const NorthCarolina = () => {
  const [ idType, setIdType ] = React.useState<NorthCarolinaIdentityType>(northCarolinaIdentityType[0])
  const [ idData, setIdData ] = React.useState<string>('')
  const [ dateMoved, setDateMoved ] = React.useState<string>('')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<NorthCarolinaInfo> | null => {
    if (!idData) return null

    return {
      ...baseInfo,
      state: 'North Carolina',
      idType,
      idData,
      dateMoved,
    }
  }

  return <SignatureBase<NorthCarolinaInfo> enrichValues={enrichValues}>
    <p>North Carolina requires voters to confirm their identify using one of the following types of identification</p>
    <Select
      label='Identification Type'
      options={[...northCarolinaIdentityType]}
      value={idType}
      onChange={v => setIdType(v)}
      {...{required: true}}
    />
    <BaseInput
      id='identityData'
      value={idData}
      onChange={e => setIdData(e.currentTarget.value)}
      label='Identity Information'
      pattern='\d\d\d\d+'
      required={true}
    />
    <Togglable
      id='mailing'
      label='I have not lived at this address for more than 30 days'
    >{
      (checked) => <DateInput
        label='Date moved'
        value={dateMoved}
        onChange={e => setDateMoved(e.currentTarget.value)}
        required={checked}
      />
    }</Togglable>
  </SignatureBase>
}
