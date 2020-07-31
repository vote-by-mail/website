import React from 'react'

import Select from 'muicss/lib/react/select'
import Option from 'muicss/lib/react/option'

import { NewHampshireInfo, isNewHampshirePrimaryParty, newHampshirePrimaryParty, primaryEligible } from '../../common'
import { SignatureBase } from './Base'
import { useControlRef } from '../util/ControlRef'

export const NewHampshire = () => {
  const primaryPartyRef = useControlRef<Select>()
  const newHampshirePrimary = primaryEligible('New Hampshire')

  return <SignatureBase<NewHampshireInfo>
    enrichValues={(info) => {
      if (newHampshirePrimary) {
        const primaryParty = primaryPartyRef.value()
        if (!isNewHampshirePrimaryParty(primaryParty)) return null

        return {
          ...info,
          state: 'New Hampshire',
          primaryParty,
        }
      }
      return {
        ...info,
        state: 'New Hampshire',
      }
    }}
  >
    {newHampshirePrimary && <Select ref={primaryPartyRef} label='Party for Primary Ballot' defaultValue='Select' {...{required: true}}>
      <Option key={0} hidden={true}/>
      {[...newHampshirePrimaryParty].sort().map((value, key) => {
        return <Option value={value} key={key+1} label={value}/>
      })}
    </Select>}
  </SignatureBase>
}
