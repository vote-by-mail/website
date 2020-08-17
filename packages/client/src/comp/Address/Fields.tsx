import React from 'react'
import Input from 'muicss/lib/react/input'
import styled from 'styled-components'
import { BaseInput } from '../util/Input'
import { Select, Option } from 'muicss/react'
import { useControlRef } from '../util/ControlRef'
import { RoundedButton } from '../util/Button'
import { allStates } from '../../common'
import { useAppHistory } from '../../lib/path'
import { AddressInputPartContainer } from './Container'
import { FetchingDataContainer } from '../../lib/unstated'

interface Props {
  type: 'initialAddress' | 'separateMailing'
}

const FlexBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-flow: row wrap;
  align-items: center;
  margin: 1em 0;
`

const Flex = styled.div<{ basis?: string }>`
  flex-basis: ${p => p.basis ?? '100%'};
  /* Fixes needless scrollbars showing on Linux/Windows */
  .mui-select label { overflow: hidden; }
`

// Since react-hooks/exhaustive-deps will trigger re-renders due to its
// depedencies, we declare this function outside of our component.
const useDidMount = (fun: () => void) => React.useEffect(fun, [])

export const AddressFields: React.FC<Props> = ({ type }) => {
  const {
    fields: baseAddressFields,
    mailingFields,
    setField: setBaseAddressField,
    setMailingField,
  } = AddressInputPartContainer.useContainer()
  const { path } = useAppHistory()
  const addrRef = useControlRef<Input>()
  const fields = type === 'initialAddress' ? baseAddressFields : mailingFields
  const setField = type === 'initialAddress' ? setBaseAddressField : setMailingField
  const { fetchingData } = FetchingDataContainer.useContainer()
  // When we first arrive at page, set focus and move cursor to beginning
  useDidMount(() => {
      if (type === 'initialAddress') {
        if (path?.type === 'address' && addrRef?.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const controlEl = (addrRef.current as any).controlEl as HTMLInputElement
          controlEl.focus({preventScroll: true})
          controlEl.setSelectionRange(0, 0)
        }
      }
  })

  return <FlexBox>
    {/* We use a 7:3 basis proportion between Flex Components */}
    {/* The spacing between them 2% of the basis */}

    <Flex basis='70%'>
      <BaseInput
        id='addr-street-input'  // This id is used for Warning Box to fill form quickly
        label='Street Address'
        ref={addrRef}
        required
        translate='no'
        lang='en'
        value={fields?.street}
        onChange={e => setField('street', e.currentTarget.value)}
      />
    </Flex>

    <Flex basis='28%'>
      <BaseInput
        label='Apartment'
        id='addr-apt-input'
        translate='no'
        lang='en'
        value={fields?.unit}
        onChange={e => setField('unit', e.currentTarget.value)}
      />
    </Flex>

    <Flex basis='40%'>
      <BaseInput
        id='addr-city-input'  // This id is used for Warning Box to fill form quickly
        label='City'
        required
        translate='no'
        lang='en'
        value={fields?.city}
        onChange={e => setField('city', e.currentTarget.value)}
      />
    </Flex>

    <Flex basis='28%' className='mui-select'>
      <Select
        id='addr-state-input'  // This id is used for Warning Box to fill form quickly
        label='State'
        translate='no'
        lang='en'
        onChange={e => {
          // MuiCSS has a buggy support for <Select/> when using TypeScript,
          // to really access HTMLSelect and its value we to do this hack
          const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
          setField('state', trueSelect.value)
        }}
      >
        {
          [...allStates].sort().map((state) => {
            return <Option
              key={state}
              value={state}
              selected={state === fields?.state}
              label={state}
            >
              {state}
            </Option>
          })
        }
      </Select>
    </Flex>

    <Flex basis='28%'>
      <BaseInput
        id='addr-zip-input'  // This id is used for Warning Box to fill form quickly
        label='ZIP code'
        required
        translate='no'
        lang='en'
        pattern='[0-9]{5}'
        value={fields?.postcode}
        onChange={e => setField('postcode', e.currentTarget.value)}
      />
    </Flex>

    {
      type === 'initialAddress' && <Flex>
        <RoundedButton
          id='addr-submit'  // This id is used for Warning Box to submit form quickly
          color='primary'
          variant='raised'
          data-testid='submit'
          style={{flexGrow: 0}}
          disabled={fetchingData}
        >
          Find my election official
        </RoundedButton>
      </Flex>
    }
  </FlexBox>
}
