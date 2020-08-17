import React from 'react'
import { createContainer } from 'unstated-next'
import { AddressInputParts, Address } from '../../common'
import { useAppHistory, StartSectionPath, AddressPath, StatePath, StateRedirectPath, SuccessPath } from '../../lib/path'
import { AddressContainer } from '../../lib/unstated'

type InputId = keyof AddressInputParts

const removeOptionalFields = (fields: AddressInputParts) => ({
  ...fields,
  unit: fields.unit ? fields.unit : undefined,
})

const handleDefault = (
  id: InputId,
  address: Address | null,
  path: StartSectionPath | AddressPath | StatePath | StateRedirectPath | SuccessPath | null,
  query: Record<string, string>,
): string => {
  if ((id === 'postcode' || id === 'state') && path?.type === 'address') {
    const normalizedId = id === 'state' ? id : 'zip'
    return path[normalizedId]
      ? path[normalizedId] as string
      : (address && address[id]) ?? query[id] ?? ''
  }
  if (id === 'state' && path?.type === 'state') {
    return path.state ?? address?.state ?? query[id] ?? ''
  }

  return (address && address[id]) ?? query[id] ?? ''
}

const useFields = () => {
  const { path, query } = useAppHistory()
  const { address } = AddressContainer.useContainer()

  const [ _fields, _setField ] = React.useState<AddressInputParts>({
    city: handleDefault('city', address, path, query),
    postcode: handleDefault('postcode', address, path, query),
    state: handleDefault('state', address, path, query),
    street: handleDefault('street', address, path, query),
    unit: handleDefault('unit', address, path, query),
  })

  const setField = (id: InputId, value: string) => {
    _setField({ ..._fields, [id]: value })
  }

  // Some users might not use a separate mailing address, only create this
  // state when needed.
  const [ _mailingFields, _setMailingField ] = React.useState<AddressInputParts>({
    city: '',
    postcode: '',
    // This is most likely to remain the same
    state: handleDefault('state', address, path, query),
    street: '',
    unit: '',
  })

  const setMailingField = (id: InputId, value: string) => {
    _setMailingField({ ..._mailingFields, [id]: value })
  }

  // Automatically removes empty optional values
  const fields = removeOptionalFields(_fields) as AddressInputParts
  const mailingFields = removeOptionalFields(_mailingFields)

  return {
    fields,
    setField,
    mailingFields,
    setMailingField,
  }
}

/**
 * Unlike AddressContainer this one is related to users inputs, and not
 * the pushed address of the application (although these two might share
 * the same value)
 */
export const AddressInputPartContainer = createContainer(useFields)
