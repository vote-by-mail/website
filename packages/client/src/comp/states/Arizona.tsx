import React from 'react'

import Select from 'muicss/lib/react/select'
import Option from 'muicss/lib/react/option'


import { ArizonaInfo, isArizonaParty, arizonaParty, arizonaIdentityType, isArizonaIdentity } from '../../common'
import { Base } from './Base'
import { useControlRef } from '../util/ControlRef'
import { BaseInput } from '../util/Input'

const arizonaPrimary = process.env.REACT_APP_ARIZONA_PRIMARY

export const Arizona = () => {
  const partyRef = useControlRef<Select>()
  const idTypeRef = useControlRef<Select>()
  const idDataRef = useControlRef<Select>()

  return <Base<ArizonaInfo>
    enrichValues={(info) => {
      const idType  = idTypeRef.value()
      if (!isArizonaIdentity(idType)) return null

      const idData = idDataRef.value()
      if (!idData) return null

      const base: ArizonaInfo = {
        ...info,
        state: 'Arizona',
        idType,
        idData,
      }

      if (arizonaPrimary) {
        const party  = partyRef.value()
        if (!isArizonaParty(party)) return null
        base.party = party
      }

      return base
    }}
  >
    {arizonaPrimary && <Select ref={partyRef} label='Party for Primary Ballot' defaultValue='Select' {...{required: true}}>
      <Option key={0} hidden={true}/>
      {[...arizonaParty].sort().map((value, key) => {
        return <Option value={value} key={key+1} label={value}/>
      })}
    </Select>}
    <p>Arizona requires voters to confirm their identify using one of the following types of identification</p>
    <Select ref={idTypeRef} label='Identification Type' defaultValue='Select' {...{required: true}}>
      <Option key={0} hidden={true}/>
      {[...arizonaIdentityType].sort().map((value, key) => {
        return <Option value={value} key={key+1} label={value}/>
      })}
    </Select>
    <BaseInput
      id='identityData'
      ref={idDataRef}
      label='Identity Information'
      required={true}
    />
  </Base>
}
