import React from 'react'
import 'jest-canvas-mock'
import { render, fireEvent, act, wait, RenderResult } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router'
import SignatureCanvas from 'react-signature-canvas'
jest.mock('react-signature-canvas')

import { Wisconsin } from './Wisconsin'
import { UnstatedContainer } from "../StateContainer"
import { client } from '../../lib/trpc'
import { mocked } from 'ts-jest/utils'
import { toPath, SuccessPath, parseQS } from '../../lib/path'
import { AddressContainer, ContactContainer } from '../../lib/unstated'
import { ContactData } from '../../common'
jest.mock('../../lib/trpc')

/** Fill out form without signing */
const fillWithoutSigning = async ({getByLabelText}: RenderResult) => {
  act(() => {
    fireEvent.change(getByLabelText(/^First Name/i), {
      target: {
        value: 'Bob'
      },
    })
    fireEvent.change(getByLabelText(/^Last Name/i), {
      target: {
        value: 'Smith'
      },
    })
    fireEvent.change(getByLabelText(/^Birthdate/i), {
      target: {
        value: '03/22/1900'
      },
    })
    fireEvent.change(getByLabelText(/^Email/i), {
      target: {
        value: 'bob.smith@gmail.com'
      },
    })
    fireEvent.change(getByLabelText(/^Phone/i), {
      target: {
        value: '123-456-7890'
      },
    })
  })
}

/** Triggers validation that should happen after form is filled */
const triggerValidation = async ({getByLabelText, getByTestId}: RenderResult) => {
  await act(async () => {
    await fireEvent.blur(getByLabelText(/^Last Name/i))
    await fireEvent.blur(getByLabelText(/^Email/i))
    await fireEvent.blur(getByLabelText(/^Phone/i))
    SignatureCanvas.prototype.isEmpty = jest.fn(() => true)
    mocked(window, true).alert = jest.fn()

    await fireEvent.click(getByTestId('submit'), {
      bubbles: true,
      cancelable: true,
    })
  })
}

const wisconsinAddress = {
  fullAddr: '1 S Pinckney St, Madison, WI 53703, USA',
  city: 'Madison',
  country: 'United States',
  state: 'Wisconsin',
  postcode: '53703',
  county: 'Dane County',
  queryAddr: '1 S Pinckney St, Madison, WI 53703'
}

const wisconsinContact: ContactData = {
  key: 'town:county',
  state: 'Wisconsin',
  city: 'town',
  county: 'county'
}

test('State Form Without Signature (Wisconsin) works', async () => {
  const history = createMemoryHistory()

  const isRegistered = mocked(client, true).isRegistered = jest.fn().mockResolvedValue({
    type: 'data',
    data: 'Active',
  })
  const register = mocked(client, true).register = jest.fn().mockResolvedValue({
    type: 'data',
    data: 'confirmationId',
  })
  mocked(client, true).fetchInitialData = jest.fn().mockResolvedValue({})
  mocked(client, true).fetchContacts = jest.fn().mockResolvedValue([])

  const renderResult = render(
    <Router history={history}>
      <AddressContainer.Provider initialState={wisconsinAddress}>
        <ContactContainer.Provider initialState={wisconsinContact}>
          <Wisconsin/>
        </ContactContainer.Provider>
      </AddressContainer.Provider>
    </Router>,
    { wrapper: UnstatedContainer }
  )

  await fillWithoutSigning(renderResult)
  await triggerValidation(renderResult)

  await wait(() => expect(isRegistered).toHaveBeenCalledTimes(1))
  await wait(
    () => expect(toPath(history.location.pathname, parseQS('')))
      .toEqual<SuccessPath>({id: "confirmationId", oid: "default", type: "success"})
  )
  await wait(() => expect(register).toHaveBeenCalledTimes(1))
})
