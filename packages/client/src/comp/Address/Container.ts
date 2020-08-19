import React from 'react'
import { createContainer } from 'unstated-next'
import { AddressInputParts, Address, getState, isState } from '../../common'
import { useAppHistory, Path } from '../../lib/path'
import { AddressContainer } from '../../lib/unstated'

type InputId = keyof AddressInputParts

export const removeOptionalAddressFields = (fields: AddressInputParts) => ({
  ...fields,
  unit: fields.unit ? fields.unit : undefined,
})

const handleDefaultState = (rawState: string) => {
  // check if a state abbreviation is used
  if (rawState.length === 2) {
    const state = getState(rawState)
    if (state) return state
  }
  if (isState(rawState)) {
    return rawState
  }

  // Return an empty string to prevent errors with invalid states in the application
  return ''
}

const handleDefault = (
  id: InputId,
  address: Address | null,
  path: Path | null,
  query: Record<string, string>,
): string => {
  // Path does not support 'postcode' but supports 'zip'
  const pathId = id === 'postcode' ? 'zip' : id

  switch (path?.type) {
    case 'state':
      if (pathId === 'state') {
        return handleDefaultState(path.state ?? address?.state ?? query[pathId] ?? '')
      }
      return ''

    case 'address':
      if (pathId === 'state' || pathId === 'zip') {
        const rawValue = path[pathId]
          ? path[pathId] as string
          : (address && address[id]) ?? query[id] ?? ''
        return pathId === 'state' ? handleDefaultState(rawValue) : rawValue
      }
      return ''

    default: return (address && address[id]) ?? query[id] ?? ''
  }
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

  // Used at WarningMsg, completely replaces the address
  const setAddress = (address: AddressInputParts) => {
    _setField(address)
  }

  // Automatically removes empty optional values
  const fields = removeOptionalAddressFields(_fields) as AddressInputParts

  return {
    fields,
    setField,
    setAddress,
  }
}

/**
 * Unlike AddressContainer this one is related to users inputs, and not
 * the pushed address of the application (although these two might share
 * the same value)
 */
export const AddressInputPartContainer = createContainer(useFields)
