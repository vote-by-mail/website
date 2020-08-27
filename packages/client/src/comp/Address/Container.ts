import React from 'react'
import { createContainer } from 'unstated-next'
import { AddressInputParts, Address, getState } from '../../common'
import { useAppHistory, Path } from '../../lib/path'
import { AddressContainer } from '../../lib/unstated'

type InputId = keyof AddressInputParts

export const removeOptionalAddressFields = (fields: AddressInputParts) => ({
  ...fields,
  unit: fields.unit ? fields.unit : undefined,
})

const handleDefault = (
  id: InputId,
  address: Address | null,
  path: Path | null,
  query: Record<string, string>,
): string => {
  // Orgs' default value for every field has precedence over all others
  // defaults, since they are always assigned as query params, this condition
  // checks if they are present here.
  if (query[id]) {
    return query[id]
  }

  // Path does not support 'postcode' but supports 'zip'
  const pathId = id === 'postcode' ? 'zip' : id

  switch (path?.type) {
    // Some orgs might not use the newly accepted query params to input
    // their default values, and instead rely on the standard way of assigning
    // a state, i.e. `#/org/oid/address/State`.
    //
    // In this case both 'state' and 'zip'/'postcode' are capable of having
    // default values.
    case 'address': {
      if (pathId === 'state' || pathId === 'zip') {
        return path[pathId]
          ? path[pathId] as string
          : (address && address[id]) ?? ''
      }

      return (address && address[id]) ?? ''
    }

    // It's very unlikely that address is going to contain a default value
    // when path.type is not the case above. But avoid not picking a default
    // value we check for it nonetheless.
    default: return (address && address[id]) ?? ''
  }
}

const useFields = () => {
  const { path, query } = useAppHistory()
  const { address } = AddressContainer.useContainer()

  const [ _fields, _setField ] = React.useState<AddressInputParts>({
    city: handleDefault('city', address, path, query),
    postcode: handleDefault('postcode', address, path, query),
    state: getState(handleDefault('state', address, path, query)) ?? 'Arizona',
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
