import React from 'react'
import { client } from '../../lib/trpc'
import { AddressContainer, ContactContainer, FetchingDataContainer } from '../../lib/unstated'
import { TimeoutError } from '@tianhuil/simple-trpc/dist/timedFetch'
import { StatusReport } from '../status/StatusReport'
import { useParams } from 'react-router-dom'
import { useAppHistory } from '../../lib/path'
import { getState } from '../../common'
import { AppForm } from '../util/Form'
import { Unidentified } from '../status/Status'
import { toast } from 'react-toastify'
import { AddressInputPartContainer } from '.'
import { AddressInput } from './Input'
import { RoundedButton } from '../util/Button'

// pulled out for testing
export const RawAddressForm: React.FC<{rawState: string, zip?: string}> = ({rawState}) => {
  const { fields, setField } = AddressInputPartContainer.useContainer()
  const { pushState } = useAppHistory()
  const { setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()
  const { fetchingData, setFetchingData } = FetchingDataContainer.useContainer()

  const state = getState(rawState)
  if (!state) {
    return <Unidentified state={rawState}/>
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.persist()  // allow async function call
    event.preventDefault()

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
      <AddressInput fields={fields} setField={setField}/>
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
    </AppForm>
  </StatusReport>
}

export const AddressForm = () => {
  const { state, zip } = useParams()
  if (!state) throw Error('state not set in AddressForm')
  return <RawAddressForm rawState={state} zip={zip} />
}
