import React from 'react'
import { createContainer } from 'unstated-next'
import { AddressInputParts, Address, getState, isState, State } from '../../common'
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

  // We allow both the application and orgs to autofill the address input,
  // orgs have the highest priority when we assign the default values.
  switch (path?.type) {
    // The app itself can only auto-fill the state field when path === state.
    // It's almost unlikely for the application to be loaded on this state,
    // since this is the actual signup flow page; we coded this case here
    // to avoid unexpected behavior.
    case 'state':
      if (pathId === 'state') {
        return handleDefaultState(query[pathId] ?? path.state ?? address?.state ?? '')
      }
      return query[id] ?? ''

    // When users have already typed a zip code on <EnterZip/> and are
    // entering the detailed information of their address, the app itself
    // is only capable of auto-filling state and postcode here, but again
    // we ensure orgs' autofilled values are passed through.
    case 'address': {
      if (pathId === 'state' || pathId === 'zip') {
        const rawValue = path[pathId]
          ? query[id] ?? path[pathId] as string
          : query[id] ?? (address && address[id]) ?? ''
        return pathId === 'state' ? handleDefaultState(rawValue) : rawValue
      }

      const rawValue = query[id] ?? (address && address[id]) ?? ''
      return id === 'state' ? handleDefaultState(rawValue) : rawValue
    }

    // Ensures orgs' default values are assigned by default, this happens
    // on all pages not covered above, so when users start their signup
    // flow these values are already defined.
    default: {
      const rawValue = query[id] ?? (address && address[id]) ?? ''
      return id === 'state' ? handleDefaultState(rawValue) : rawValue
    }
  }
}

const useFields = () => {
  const { path, query } = useAppHistory()
  const { address } = AddressContainer.useContainer()

  const [ _fields, _setField ] = React.useState<AddressInputParts>({
    city: handleDefault('city', address, path, query),
    postcode: handleDefault('postcode', address, path, query),
    state: handleDefault('state', address, path, query) as State,
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
