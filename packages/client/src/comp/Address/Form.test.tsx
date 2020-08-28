import React from 'react'
import { render, fireEvent, waitForElement, act, wait } from '@testing-library/react'
import { RawAddressForm } from './Form'
import { UnstatedContainer } from "../StateContainer"
import { client } from '../../lib/trpc'
import { pageView } from '../../lib/analytics'
import { mocked } from 'ts-jest/utils'
import { AddressInputParts } from '../../common'
import { AddressInputPartContainer } from './Container'

jest.mock('../../lib/analytics')
jest.mock('../../lib/trpc')
jest.mock('../../common/contact.ts')

const mailingAddress: AddressInputParts = {
  street: '100 Biscayne Blvd',
  unit: '11',
  city: 'Miami',
  state: 'Florida',
  postcode: '33131',
}

const buggyAddress: AddressInputParts = {
  street: '560 Courtney Drive',
  city: 'Fairport',
  state: 'New York',
  postcode: '14450',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fillInputs = async (inputParts: AddressInputParts, getByTestId: any) => {
  await act(async () => {
    const streetInput = getByTestId('addressFieldStreet')
    const apartmentInput = getByTestId('addressFieldApartment')
    const cityInput = getByTestId('addressFieldCity')
    const stateInput = getByTestId('addressFieldState').firstChild
    const zipInput = getByTestId('addressFieldPostcode')

    await fireEvent.change(streetInput, {
      target: { value: inputParts.street },
    })
    await fireEvent.change(apartmentInput, {
      target: { value: inputParts.unit },
    })
    await fireEvent.change(cityInput, {
      target: { value: inputParts.city },
    })
    await fireEvent.change(stateInput, {
      target: { value: inputParts.state },
    })
    await fireEvent.change(zipInput, {
      target: { value: inputParts.postcode },
    })

    await fireEvent.click(getByTestId('submit'), {
      bubbles: true,
      cancelable: true,
    })

    // https://stackoverflow.com/questions/60504720/jest-cannot-read-property-createevent-of-null
    await wait()
  })
}

test('AddressForm works', async () => {
  const mockedPageView = mocked(pageView)

  const fetchContactAddress = mocked(client, true).fetchContactAddress = jest.fn().mockResolvedValue({
    type: 'data',
    data: {
      contact: null,
      address: null,
    },
  })

  const { getByTestId } = render(
    <AddressInputPartContainer.Provider initialState={mailingAddress}>
      <RawAddressForm rawState='Florida'/>
    </AddressInputPartContainer.Provider>,
    { wrapper: UnstatedContainer }
  )

  await fillInputs(mailingAddress, getByTestId)
  await waitForElement(() => getByTestId('status-title'))

  expect(fetchContactAddress).toHaveBeenCalledTimes(1)
  expect(mockedPageView).toHaveBeenCalledTimes(1)
  expect(getByTestId('status-title')).toHaveTextContent('Great News!')
  expect(getByTestId('status-detail')).toHaveTextContent('Florida')
})

test('Allow users to choose election official on errors', async () => {
  const mockedPageView = mocked(pageView)
  const validCounty = ':valid county'

  const fetchContacts = mocked(client, true).fetchContacts = jest.fn().mockResolvedValue({
    type: 'data',
    data: [':wrong county', validCounty],
  })
  const fetchContactAddress = mocked(client, true).fetchContactAddress = jest.fn().mockResolvedValue({
    type: 'error',
    message: 'Unable to find contact',
  })
  const getContact = mocked(client, true).getContact = jest.fn().mockResolvedValue({
    type: 'data',
    data: {
      method: {
        stateMethod: 'test',
      }
    },
  })

  const { getByTestId } = render(
    <AddressInputPartContainer.Provider initialState={buggyAddress}>
      <RawAddressForm rawState='New York'/>
    </AddressInputPartContainer.Provider>,
    { wrapper: UnstatedContainer }
  )

  await fillInputs(buggyAddress, getByTestId)
  expect(fetchContactAddress).toHaveBeenCalledTimes(1)
  expect(fetchContacts).toHaveBeenCalledTimes(1)
  await waitForElement(() => getByTestId('address-error-modal'))

  const contactSelect = getByTestId('address-error-modal-contact').firstChild
  const contactSubmit = getByTestId('address-error-modal-submit')
  await act(async() => {
    await fireEvent.change(contactSelect, {
      target: { value: validCounty },
    })
    await fireEvent.click(contactSubmit, { bubbles: true, cancelable: true })
  })

  expect(getContact).toHaveBeenCalledWith(buggyAddress.state, validCounty)
  // Expects two here since it's run with every history push
  expect(mockedPageView).toHaveBeenCalledTimes(2)
})
