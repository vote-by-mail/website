import React from 'react'
import Input from 'muicss/lib/react/input'
import styled from 'styled-components'
import { BaseInput } from '../util/Input'
import { useControlRef } from '../util/ControlRef'
import { allStates, AddressInputParts, State } from '../../common'
import { useAppHistory } from '../../lib/path'
import { cssQuery } from '../util/cssQuery'
import { Select } from '../util/Select'

const options: readonly State[] = [...allStates].sort()

interface Props {
  fields: AddressInputParts
  setField: (id: keyof AddressInputParts, value: string) => void
}

const FlexBox = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-flow: row wrap;
  align-items: flex-end;
  margin: 1em 0;
`

const Flex = styled.div<{ basis?: string, mobileBasis?: string }>`
  flex-basis: ${p => p.mobileBasis ?? '100%'};
  ${cssQuery.medium} { flex-basis: ${p => p.basis ?? '100%'}; }
  /* Fixes needless scrollbars showing on Linux/Windows */
  .mui-select label { overflow: hidden; }
`

// Since react-hooks/exhaustive-deps will trigger re-renders due to its
// depedencies, we declare this function outside of our component.
const useDidMount = (fun: () => void) => React.useEffect(fun, [])

export const AddressInput: React.FC<Props> = ({ fields, setField }) => {
  const { path } = useAppHistory()
  const addrRef = useControlRef<Input>()

  // When we first arrive at page, set focus and move cursor to beginning
  useDidMount(() => {
    if (path?.type === 'address' && addrRef?.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controlEl = (addrRef.current as any).controlEl as HTMLInputElement
      controlEl.focus({preventScroll: true})
      controlEl.setSelectionRange(0, 0)
    }
  })

  return <FlexBox>
    {/* We use a 7:3 basis proportion between Flex Components */}
    {/* The spacing between them 2% of the basis */}

    <Flex basis='18%' mobileBasis='28%'>
      <BaseInput
        label='Street Number'
        translate='no'
        lang='en'
        value={fields?.streetNumber}
        onChange={e => setField('streetNumber', e.currentTarget.value)}
        data-testid='addressFieldStreetNumber'
      />
    </Flex>

    <Flex basis='50%' mobileBasis='70%'>
      <BaseInput
        label='Street Address'
        ref={addrRef}
        required
        translate='no'
        lang='en'
        value={fields?.street}
        onChange={e => setField('street', e.currentTarget.value)}
        data-testid='addressFieldStreet'
      />
    </Flex>

    <Flex basis='28%'>
      <BaseInput
        label='Apartment'
        translate='no'
        lang='en'
        value={fields?.unit}
        onChange={e => setField('unit', e.currentTarget.value)}
        data-testid='addressFieldApartment'
      />
    </Flex>

    <Flex basis='40%'>
      <BaseInput
        label='City'
        required
        translate='no'
        lang='en'
        value={fields?.city}
        onChange={e => setField('city', e.currentTarget.value)}
        data-testid='addressFieldCity'
      />
    </Flex>

    <Flex basis='28%' mobileBasis='49%'>
      <Select<typeof options>
        label='State'
        translate='no'
        lang='en'
        onChange={value => setField('state', value)}
        value={fields.state as State}
        data-testid='addressFieldState'
        options={options}
      />
    </Flex>

    <Flex basis='28%' mobileBasis='49%'>
      <BaseInput
        label='ZIP code'
        required
        translate='no'
        lang='en'
        pattern='[0-9]{5}'
        value={fields?.postcode}
        onChange={e => setField('postcode', e.currentTarget.value)}
        data-testid='addressFieldPostcode'
      />
    </Flex>
  </FlexBox>
}
