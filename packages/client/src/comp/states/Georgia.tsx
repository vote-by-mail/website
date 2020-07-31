import React from 'react'

import { GeorgiaInfo, isGeorgiaParty, georgiaParty, primaryEligible } from '../../common'
import Input from 'muicss/lib/react/input'
import { useControlRef } from '../util/ControlRef'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'

import Select from 'muicss/lib/react/select'
import Option from 'muicss/lib/react/option'

export const Georgia = () => {
  const partyRef = useControlRef<Input>()
  const georgiaPrimary = primaryEligible('Georgia')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<GeorgiaInfo> | null => {
    if (georgiaPrimary) {
      const party = partyRef.value()
      if (!isGeorgiaParty(party)) return null

      return {
        ...baseInfo,
        state: 'Georgia',
        party,
      }
    }
    return {
      ...baseInfo,
      state: 'Georgia',
    }
  }

  if (georgiaPrimary) {
    return <SignatureBase<GeorgiaInfo> enrichValues={enrichValues}>
      <Select ref={partyRef} label='Party for Primary Ballot' defaultValue='Select' {...{required: true}}>
        <Option key={0} hidden={true}/>
        {[...georgiaParty].sort().map((value, key) => {
          return <Option value={value} key={key+1} label={value}/>
        })}
      </Select>
    </SignatureBase>
  }
  return <SignatureBase<GeorgiaInfo> enrichValues={enrichValues}/>
}
