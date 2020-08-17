import React from 'react'
import Input from 'muicss/lib/react/input'

import { RoundedButton } from '../util/Button'
import { client } from '../../lib/trpc'
import { AddressContainer, ContactContainer, FetchingDataContainer } from '../../lib/unstated'
import { useControlRef } from '../util/ControlRef'
import { TimeoutError } from '@tianhuil/simple-trpc/dist/timedFetch'
import { BaseInput } from '../util/Input'
import { StatusReport } from '../status/StatusReport'
import { useParams } from 'react-router-dom'
import { useAppHistory } from '../../lib/path'
import styled from 'styled-components'
import { getState, allStates } from '../../common'
import { AppForm } from '../util/Form'
import { Unidentified } from '../status/Status'
import { toast } from 'react-toastify'
import { AddressInputPartContainer } from '.'
import { Select, Option } from 'muicss/react'

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

// pulled out for testing
export const RawAddressForm: React.FC<{rawState: string, zip?: string}> = ({rawState}) => {
  const { fields, setField } = AddressInputPartContainer.useContainer()
  const { path, pushState } = useAppHistory()
  const addrRef = useControlRef<Input>()
  const { setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()
  const { fetchingData, setFetchingData } = FetchingDataContainer.useContainer()


  // When we first arrive at page, set focus and move cursor to beginning
  useDidMount(() => {
    if (path?.type === 'address' && addrRef?.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controlEl = (addrRef.current as any).controlEl as HTMLInputElement
      controlEl.focus({preventScroll: true})
      controlEl.setSelectionRange(0, 0)
    }
  })

  const state = getState(rawState)
  if (!state) {
    return <Unidentified state={rawState}/>
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.persist()  // allow async function call
    event.preventDefault()

    const addr = addrRef.value()
    if (addr === null) throw Error('address ref not set')
    if (!state) throw Error('This can never happen: already checked if state is valid')

    setFetchingData(true)
    try {
      setContact(null)
      setAddress(null)
      const result = await client.fetchContactAddress(fields)
      switch(result.type) {
        case 'data': {
          const {contact, address} = result.data
          setContact(contact)
          setAddress(address)

          break
        }
        case 'error': {
          toast.error(<><b>Server Error:</b> {result.message}.  Try resubmitting.  If this persists, try again in a little while.</>)
          return
        }
      }
      pushState(state)
    } catch(e) {
      toast.dismiss()
      if (e instanceof TimeoutError) {
        toast.error(<><b>Timeout Error:</b> Try resubmitting.  If this persists, try again in a little while.</>)
      } else if (e instanceof TypeError) {
        toast.error(<><b>Connection Error:</b> Try resubmitting.  If this persists, try again in a little while.</>)
      } else {
        toast.error(<><b>Unknown Error:</b> Try resubmitting.  If this persists, try again in a little while.</>)
      }
    } finally {
      setFetchingData(false)
    }
  }

  return <StatusReport state={state}>
    <AppForm onSubmit={handleSubmit}>
      <p>
        Enter your <b>voter-registration address</b> to find your local election official.
        (<a target='_blank' rel='noopener noreferrer' href='https://www.vote.org/am-i-registered-to-vote/'>Unsure if you are registered?</a>)
      </p>
      <FlexBox>
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
            value={fields.street}
            onChange={e => setField('street', e.currentTarget.value)}
          />
        </Flex>

        <Flex basis='28%'>
          <BaseInput
            label='Apartment'
            id='addr-apt-input'
            translate='no'
            lang='en'
            value={fields.unit}
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
            value={fields.city}
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
              // to really access the HTMLSelect and its value we need
              // to do this hack
              const trueSelect = e.currentTarget.firstChild as HTMLSelectElement
              setField('state', trueSelect.value)
            }}
          >
            {
              [...allStates].sort().map((state, key) => {
                return <Option
                  key={`${state}${key}`}
                  value={state}
                  selected={state === fields.state}
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
            value={fields.postcode}
            onChange={e => setField('postcode', e.currentTarget.value)}
          />
        </Flex>

        <Flex>
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
      </FlexBox>
    </AppForm>
  </StatusReport>
}

export const AddressForm = () => {
  const { state, zip } = useParams()
  if (!state) throw Error('state not set in AddressForm')
  return <RawAddressForm rawState={state} zip={zip} />
}
