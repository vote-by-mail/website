import React from 'react'
import { createContainer } from 'unstated-next'
import { AddressInputParts, Address } from '../../common'
import { useAppHistory, StartSectionPath, AddressPath, StatePath, StateRedirectPath, SuccessPath } from '../../lib/path'
import { AddressContainer } from '../../lib/unstated'

type InputId = keyof AddressInputParts
type RequiredFields = Exclude<InputId, 'unit'>
type OptionalFields = 'unit'

type Fields = Record<RequiredFields, string> & Partial<Record<OptionalFields, string>>

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

  const [ _fields, _setField ] = React.useState<Fields>({
    city: handleDefault('city', address, path, query),
    postcode: handleDefault('postcode', address, path, query),
    state: handleDefault('state', address, path, query),
    street: handleDefault('street', address, path, query),
    unit: handleDefault('unit', address, path, query),
  })

  // Automatically removes empty optional values
  const fields: Fields = {
    ..._fields,
    unit: _fields.unit ? _fields.unit : undefined,
  }

  const setField = (id: InputId, value: string) => {
    _setField({ ...fields, [id]: value })
  }

  return {
    fields,
    setField,
  }
}

/**
 * Unlike AddressContainer this one is related to users inputs, and not
 * the pushed address of the application (although these two might share
 * the same value)
 */
export const AddressInputPartContainer = createContainer(useFields)
