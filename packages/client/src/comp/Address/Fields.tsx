import React from 'react'
import Input from 'muicss/lib/react/input'
import styled from 'styled-components'
import { BaseInput } from '../util/Input'
import { Select, Option } from 'muicss/react'
import { useControlRef } from '../util/ControlRef'
import { allStates, AddressInputParts } from '../../common'
import { useAppHistory } from '../../lib/path'
import { cssQuery } from '../util/cssQuery'

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

export const AddressFields: React.FC<Props> = ({ fields, setField }) => {
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

    <Flex basis='70%'>
      <BaseInput
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
        translate='no'
        lang='en'
        value={fields?.unit}
        onChange={e => setField('unit', e.currentTarget.value)}
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
      />
    </Flex>

    <Flex basis='28%' mobileBasis='49%'>
      <Select
        label='State'
        translate='no'
        lang='en'
        onChange={e => {
          // MuiCSS has a buggy support for <Select/> when using TypeScript,
          // to really access HTMLSelect and its value we to do this hack
          const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
          setField('state', trueSelect.value)
        }}
        defaultValue={fields?.state}
        data-testid='addressFieldState'
      >
        {
          [...allStates].sort().map((state) => {
            return <Option
              key={state}
              value={state}
              label={state}
              selected={state===fields.state}
            >
              {state}
            </Option>
          })
        }
      </Select>
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
      />
    </Flex>
  </FlexBox>
}
