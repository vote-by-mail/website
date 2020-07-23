import React from 'react'
import { createContainer } from 'unstated-next'
import { InputData } from './BaseContainer'

export type AddressInputId =
  | 'street'
  | 'apt'
  | 'city'
  | 'state'
  | 'zip'

const useInput = () => {
  const [fields, _update] = React.useState<Record<AddressInputId, InputData>>({
    street: { valid: true, value: '' },
    city: { valid: true, value: '' },
    state: { valid: true, value: '' },
    zip: { valid: true, value: '' },
    apt: { valid: true, value: '' },
  })

  const updateInput = (id: AddressInputId, value: string) => {
    _update({ ...fields, [id]: { value } })
  }

  return {
    updateInput,
    fields
  }
}

export const AddressFormContainer = createContainer(useInput)
