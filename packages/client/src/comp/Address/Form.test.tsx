import React from 'react'
import { render, fireEvent, waitForElement, act } from '@testing-library/react'
import { RawAddressForm } from './Form'
import { UnstatedContainer } from "../StateContainer"
import { client } from '../../lib/trpc'
import { pageView } from '../../lib/analytics'
import { mocked } from 'ts-jest/utils'
import { AddressInputParts } from '../../common'

jest.mock('../../lib/analytics')
jest.mock('../../lib/trpc')

const mailingAddress: AddressInputParts = {
  street: '100 Biscayne Blvd',
  unit: '11',
  city: 'Miami',
  state: 'Florida',
  postcode: '33131',
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

  const { getByLabelText, getByTestId } = render(
    <RawAddressForm rawState='Florida'/>,
    { wrapper: UnstatedContainer }
  )

  await act(async () => {
    const streetInput = getByLabelText(/^Street Address/i)
    const apartmentInput = getByLabelText(/^Apartment/i)
    const cityInput = getByLabelText(/^City/i)
    const stateInput = getByTestId('addressFieldState').firstChild
    const zipInput = getByLabelText(/^ZIP code/i)

    await fireEvent.change(streetInput, {
      target: { value: mailingAddress.street },
    })
    await fireEvent.change(apartmentInput, {
      target: { value: mailingAddress.unit },
    })
    await fireEvent.change(cityInput, {
      target: { value: mailingAddress.city },
    })
    await fireEvent.change(stateInput, {
      target: { value: mailingAddress.state },
    })
    await fireEvent.change(zipInput, {
      target: { value: mailingAddress.postcode },
    })

    await fireEvent.click(getByTestId('submit'), {
      bubbles: true,
      cancelable: true,
    })
  })

  await waitForElement(() => getByTestId('status-title'))

  expect(fetchContactAddress).toHaveBeenCalledTimes(1)
  expect(mockedPageView).toHaveBeenCalledTimes(1)
  expect(getByTestId('status-title')).toHaveTextContent('Great News!')
  expect(getByTestId('status-detail')).toHaveTextContent('Florida')
})
