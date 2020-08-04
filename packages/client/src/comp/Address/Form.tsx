import React from 'react'
import { client } from '../../lib/trpc'
import { AddressContainer, ContactContainer, ExperimentContainer, FetchingDataContainer } from '../../lib/unstated'
import { TimeoutError } from '@tianhuil/simple-trpc/dist/timedFetch'
import { StatusReport } from '../status/StatusReport'
import { useParams } from 'react-router-dom'
import { useAppHistory } from '../../lib/path'
import { getState } from '../../common'
import { AppForm } from '../util/Form'
import { toast } from 'react-toastify'
import { AddressInputPartContainer } from '.'
import { AddressInput } from './Input'
import { RoundedButton } from '../util/Button'
import { AddressModal } from './Modal'
import { trackEvent } from '../lib/analytics'

// pulled out for testing
export const RawAddressForm: React.FC<{rawState: string, zip?: string}> = ({rawState}) => {
  const { fields, setField } = AddressInputPartContainer.useContainer()
  const { pushState, pushStartSection } = useAppHistory()
  const { setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()
  const { fetchingData, setFetchingData } = FetchingDataContainer.useContainer()
  const [ open, setOpen ] = React.useState(false)
  const { experimentGroup } = ExperimentContainer.useContainer()
  const addressC2a = experimentGroup('AddressC2a')

  useEffect(() => {
    trackEvent('Experiment', 'AddressC2a', addressC2a)
  }, [addressC2a])

  const state = getState(rawState)
  // Goes back to starting section if no state was found
  if (!state || !getState(fields.state)) {
    pushStartSection('start')
    return null
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
          setOpen(true)
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

  return <>
    <StatusReport state={state}>
      <AppForm onSubmit={handleSubmit}>
        <p>
          {
            addressC2a === 'FindOfficial'
              ? ' find your local election official'
              : ' sign up for Vote by Mail'
          } (<a target='_blank' rel='noopener noreferrer' href='https://www.vote.org/am-i-registered-to-vote/'>Unsure if you are registered?</a>)
        </p>
        <AddressInput fields={fields} setField={setField}/>
        <RoundedButton
          id='addr-submit'  // This id is used for Warning Box to submit form quickly
          color='primary'
          variant='raised'
          data-testid='submit'
          style={{flexGrow: 0}}
          disabled={fetchingData}
        >{
          addressC2a === 'FindOfficial'
            ? 'Find my election official'
            : 'Go to signup form'
        }</RoundedButton>
      </AppForm>
    </StatusReport>
    <AddressModal isOpen={open} setOpen={setOpen}/>
  </>
}

export const AddressForm = () => {
  const { state, zip } = useParams()

  return <RawAddressForm rawState={state} zip={zip} />
}
