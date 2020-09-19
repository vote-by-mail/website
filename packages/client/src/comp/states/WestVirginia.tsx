import React from 'react'

import {
  WestVirginiaInfo,
  westVirginiaParty,
  westVirginiaElectionLevel,
  westVirginiaElectionType,
  primaryEligible,
  WestVirginiaElectionLevel,
  WestVirginiaElectionType,
  WestVirginiaParty
} from '../../common'

import { Select } from '../util/Select'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'

export const WestVirginia = () => {
  const [ election, setElection ] = React.useState<WestVirginiaElectionLevel>('City/Town')
  const [ electionType, setElectionType ] = React.useState<WestVirginiaElectionType>('General')
  const [ party, setParty ] = React.useState<WestVirginiaParty>(westVirginiaParty[0])
  const westVirginiaPrimary = primaryEligible('West Virginia')

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<WestVirginiaInfo> => {
    return {
      ...baseInfo,
      state: 'West Virginia',
      ...(westVirginiaPrimary ? {party} : {}),
      election,
      electionType
    }
  }

  return <SignatureBase<WestVirginiaInfo> enrichValues={enrichValues}>
    <Select
      label='Election for Mail in Ballot'
      value={election}
      options={westVirginiaElectionLevel}
      onChange={v => setElection(v)}
    />
    <Select
      label='Election Type for Mail in Ballot'
      value={electionType}
      options={westVirginiaElectionType}
      onChange={v => setElectionType(v)}
    />
    {westVirginiaPrimary &&
      // Only shows party when primary is available
      <Select
        label='Party for Primary Ballot'
        value={party}
        options={westVirginiaParty}
        onChange={v => setParty(v)}
      />
    }
  </SignatureBase>
}
