import React from 'react'
import { useAppHistory } from '../../lib/path'
import { AddressContainer, FetchingDataContainer } from '../../lib/unstated'
import { client } from '../../lib/trpc'
import { toast } from 'react-toastify'
import { InputButton } from './InputButton'


/**
 * Shows a input which allows users to enter their Zip Code, if a state is
 * found it automatically starts the registration flow.
 */
export const EnterZip: React.FC = () => {
  const { path, pushAddress } = useAppHistory()
  const { address } = AddressContainer.useContainer()
  const { setFetchingData } = FetchingDataContainer.useContainer()
  const zipRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.persist()  // allow async function call
    event.preventDefault()
    const zip = zipRef?.current?.value
    if (!zip) return
    setFetchingData(true)
    const resp = await client.fetchState(zip)
    if (resp.type === 'error') {
    toast(
      'Error finding the ZIP Code',
      {type: 'error'},
      )
    } else {
      pushAddress(resp.data, zip)
    }
    setFetchingData(false)
  }

  const defaultValue = () => {
    if (path?.type === 'address' && path.zip) {
      return path.zip
    } else {
      return address?.postcode ?? undefined
    }
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
    defaultValue={defaultValue()}
    ref={zipRef}
  />
}