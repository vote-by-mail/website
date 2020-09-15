import React from 'react'
import { BaseInput } from '../util/Input'
import { VirginiaInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'

export const Virginia = () => {
  const [ last4DigitsOfSsn, setLast4DigitsOfSsn ] = React.useState<string>('')
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<VirginiaInfo> | null => {
    return {
      ...baseInfo,
      state: 'Virginia',
      last4DigitsOfSsn,
    }
  }

  return <SignatureBase<VirginiaInfo>enrichValues={enrichValues} >
    <BaseInput
      id='last4DigitsOfSsn'
      label='Last 4 Digits of Social Security Number'
      pattern='\d{4}'
      required={true}
      value={last4DigitsOfSsn}
      onChange={e => setLast4DigitsOfSsn(e.currentTarget.value)}
    />
  </SignatureBase>
}
