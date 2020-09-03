import React from 'react'
import { AddressContainer, ContactContainer } from '../lib/unstated'
import { sampleAddresses } from '../common'
import { StateForm } from './states/StateForm'
import { StateSelector, StateContainer } from './StateSelector'
import { client } from '../lib/trpc'
import styled from 'styled-components'
import { cssQuery } from './util/cssQuery'
import { AddressInputPartContainer } from './Address'

const AvoidNavbarWrapper = styled.div`
  margin-top: 100px;
  ${cssQuery.medium} { margin-top: 150px; }
`

const RawMockPage: React.FC<{}> = () => {
  const { state } = StateContainer.useContainer()
  const { setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()
  const { setAddressParts } = AddressInputPartContainer.useContainer()

  React.useLayoutEffect(() => {
    (async () =>  {
      const bareAddress = sampleAddresses[state][0]
      setAddressParts(bareAddress)
      const address = {
        queryAddr: bareAddress.address,
        fullAddr: bareAddress.address,
        country: 'United States',
        postcode: '20500',
        ...bareAddress
      }

      const result = await client.fetchContact(bareAddress)
      if (result.type === 'data') {
        setAddress(address)
        setContact(result.data)
      }
    })()
  }, [state, setAddress, setAddressParts, setContact])

  return <StateForm ignoreError={true}/>
}

export const MockPage: React.FC<{}> = () => {
  if (!process.env.REACT_APP_MOCK) return null

  return <AvoidNavbarWrapper>
    <StateSelector>
      <RawMockPage/>
    </StateSelector>
  </AvoidNavbarWrapper>
}
