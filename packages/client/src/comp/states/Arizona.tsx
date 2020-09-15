import React from 'react'

import { Select } from '../util/Select'
import { ArizonaInfo, arizonaParty, arizonaIdentityType, primaryEligible, ArizonaParty, ArizonaIdentityType } from '../../common'
import { Base } from './Base'
import { BaseInput } from '../util/Input'

export const Arizona = () => {
  const arizonaPrimary = primaryEligible('Arizona')
  const [ party, setParty ] = React.useState<ArizonaParty>(arizonaParty[0])
  const [ idType, setIdType ] = React.useState<ArizonaIdentityType>(arizonaIdentityType[0])
  const [ idData, setIdData ] = React.useState<string>('')

  return <Base<ArizonaInfo>
    enrichValues={(info) => {
      if (!idData) return null

      const base: ArizonaInfo = {
        ...info,
        state: 'Arizona',
        idType,
        idData,
      }

      if (arizonaPrimary) {
        base.party = party
      }

      return base
    }}
  >
    {arizonaPrimary &&
      <Select
        label='Party for Primary Ballot'
        value={party}
        onChange={v => setParty(v)}
        options={[...arizonaParty]}
        {...{required: true}}
      />
    }
    <p>Arizona requires voters to confirm their identify using one of the following types of identification</p>
    <Select
      label='Identification Type'
      value={idType}
      onChange={v => setIdType(v)}
      options={[...arizonaIdentityType]}
      {...{required: true}}
    />
    <BaseInput
      id='identityData'
      label='Identity Information'
      value={idData}
      onChange={e => setIdData(e.currentTarget.value)}
      required={true}
    />
  </Base>
}
