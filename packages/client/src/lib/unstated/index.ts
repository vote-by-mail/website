import React from 'react'
import { createContainer } from "unstated-next"
import { Address, ContactData, toLocale, Locale, toContactMethod, ContactMethod } from '../../common'
import { InitialData } from '../../common/initialData'

const useAddressContainer = (initialState: (Address | null) = null) => {
  const [address, setAddress] = React.useState<Address | null>(initialState)
  const locale: Locale | null = address ? toLocale(address) : null
  return { address, setAddress, locale }
}

export const AddressContainer = createContainer(useAddressContainer)

const useContactContainer = (initialState: (ContactData | null) = null) => {
  const [contact, setContact] = React.useState<ContactData | null>(initialState)
  const method: ContactMethod | null = toContactMethod(contact)
  return { contact, setContact, method }
}
export const ContactContainer = createContainer(useContactContainer)

const useInitialDataContainer = (data: InitialData | null = null) => {
  const [initialData, setInitialData] = React.useState(data)
  return { initialData, setInitialData }
}

export const InitialDataContainer = createContainer(useInitialDataContainer)

/**
 * When true replaces the mouse cursor with the operating system's default
 * for loading information.
 */
const useFetchingDataContainer = (initialFetching = false) => {
  const [fetchingData, setFetchingData] = React.useState(initialFetching)

  return { fetchingData, setFetchingData }
}

export const FetchingDataContainer = createContainer(useFetchingDataContainer)

export * from './voter'
export * from './memoize'
