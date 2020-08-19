import React from 'react'
import { FetchingDataContainer } from '../../lib/unstated'
import { client } from '../../lib/trpc'
import { toast } from 'react-toastify'
import { InputButton } from './InputButton'
import { AddressInputPartContainer } from '../Address/Container'
import { useAppHistory } from '../../lib/path'


/**
 * Shows a input which allows users to enter their Zip Code, if a state is
 * found it automatically starts the registration flow.
 */
export const EnterZip: React.FC = () => {
  const { pushAddress } = useAppHistory()
  const { setFetchingData } = FetchingDataContainer.useContainer()
  const { fields, setField } = AddressInputPartContainer.useContainer()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.persist()  // allow async function call
    event.preventDefault()
    setFetchingData(true)
    const resp = await client.fetchState(fields.postcode)
    if (resp.type === 'error') {
      toast(
        'Error finding the ZIP Code',
        {type: 'error'},
      )
    } else {
      setField('state', resp.data)
      pushAddress(resp.data, fields.postcode)
    }
    setFetchingData(false)
  }

  return <InputButton
    onSubmit={handleSubmit}
    buttonLabel='Enter'
    buttonTestId='start-submit'
    type='number'
    placeholder='ZIP Code'
    id='start-zip'
    dataTestId='start-zip'
    pattern='[0-9]{5}'
    value={fields.postcode}
    onChange={e => setField('postcode', e.currentTarget.value)}
  />
}
