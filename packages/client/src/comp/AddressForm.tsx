import React from 'react'
import Input from 'muicss/lib/react/input'

import { RoundedButton } from './util/Button'
import { client } from '../lib/trpc'
import { AddressInputs } from './AddressInputs'
import { AddressContainer, ContactContainer, FetchingDataContainer } from '../lib/unstated'
import { useControlRef } from './util/ControlRef'
import { TimeoutError } from '@tianhuil/simple-trpc/dist/timedFetch'
import { StatusReport } from './status/StatusReport'
import { useParams } from 'react-router-dom'
import { useAppHistory } from '../lib/path'
import { getState, ImplementedState, toAddressStr } from '../common'
import { AppForm } from './util/Form'
import { Unidentified } from './status/Status'
import { toast } from 'react-toastify'
import { AddressFormContainer } from './states/AddressFormContainer'

// pulled out for testing
export const RawAddressForm: React.FC<{rawState: string, zip?: string}> = ({rawState, zip}) => {
  const { path, pushState } = useAppHistory()
  const streetAddressRef = useControlRef<Input>()
  const { setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()
  const { fetchingData, setFetchingData } = FetchingDataContainer.useContainer()
  const {
    fields,
    updateInput,
  } = AddressFormContainer.useContainer()

  // When we first arrive at page, set focus and move cursor to beginning
  React.useEffect(() => {
    if (path?.type === 'address' && streetAddressRef?.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controlEl = (streetAddressRef.current as any).controlEl as HTMLInputElement
      controlEl.focus({preventScroll: true})
      controlEl.setSelectionRange(0, 0)
    }
  }, [streetAddressRef, path])

  const state = getState(rawState)
  if (!state) {
    return <Unidentified state={rawState}/>
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.persist()  // allow async function call
    event.preventDefault()

    const streetAddress = streetAddressRef.value() || ''
    const apt = fields.apt.value || undefined
    const city = fields.city.value || ''
    const stateInput = fields.state.value as ImplementedState
    const zip = fields.zip.value || ''

    if (streetAddress === null) throw Error('address ref not set')
    if (city === null) throw Error('city ref not set')
    if (stateInput === null) throw Error('stateInput ref not set')
    if (zip === null) throw Error('zip ref not set')
    if (!state) throw Error('This can never happen: already checked if state is valid')

    const formattedAddress = toAddressStr({
      streetAddress,
      apt,
      city,
      state,
      zip
    })

    setFetchingData(true)
    try {
      setContact(null)
      setAddress(null)
      const result = await client.fetchContactAddress(formattedAddress)
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

  return (
    <StatusReport state={state}>
      <AppForm onSubmit={handleSubmit}>
        <p>
          Enter your <b>voter-registration address</b> to find your local
          election official.
        </p>
        <AddressInputs
          streetAddressRef={streetAddressRef}
          fields={fields}
          updateInput={updateInput}
          defaultState={state}
          defaultZip={zip}
        />
        <div style={{ paddingTop: "15px", marginBottom: "20px" }}>
          {" "}
          {/* To match BaseInput's spacing */}
          <RoundedButton
            id="addr-submit" // This id is used for Warning Box to submit form quickly
            color="primary"
            variant="raised"
            data-testid="submit"
            style={{ flexGrow: 0 }}
            disabled={fetchingData}
          >
            Find my election official
          </RoundedButton>
        </div>
      </AppForm>
    </StatusReport>
  )
}

export const AddressForm = () => {
  const { state, zip } = useParams()
  if (!state) throw Error('state not set in AddressForm')
  return <RawAddressForm rawState={state} zip={zip} />
}
