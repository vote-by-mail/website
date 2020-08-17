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
import { ContactData, StateInfo, formatAddressInputParts, AddressInputParts } from '../../common'
import { isE164 } from '../../../../common/util'
jest.mock('../../lib/trpc')

const mailingAddress: AddressInputParts = {
  street: '100 Biscayne Blvd',
  unit: '11',
  city: 'Miami',
  state: 'Florida',
  postcode: '33131',
}

const fields = {
  firstName: 'Bob', lastName: 'Smith', birthdate: '03/22/1900',
  email: 'bob@gmail.com', phone: '123-456-7890',
  mailing: formatAddressInputParts(mailingAddress),
}

const compareResults = async (register: jest.Mock, separateMailing: boolean) => {
  const call = register.mock.calls[0][0] as StateInfo
  await expect(call.nameParts.first).toEqual(fields.firstName)
  await expect(call.nameParts.last).toEqual(fields.lastName)
  await expect(call.nameParts.middle).toEqual(undefined)
  await expect(call.nameParts.suffix).toEqual(undefined)
  await expect(call.birthdate).toEqual(fields.birthdate)
  await expect(call.email).toEqual(fields.email)
  await expect(call.phone).toEqual(fields.phone)
  if (separateMailing) {
    await expect(call.mailingAddress).toEqual(fields.mailing)
  }
}

/** Fill out form without signing */
const fillWithoutSigning = async ({getByLabelText}: RenderResult) => {
  await act(async () => {
    await fireEvent.change(getByLabelText(/^First Name/i), {
      target: {
        value: fields.firstName
      },
    })
    await fireEvent.change(getByLabelText(/^Last Name/i), {
      target: {
        value: fields.lastName
      },
    })
    await fireEvent.change(getByLabelText(/^Birthdate/i), {
      target: {
        value: fields.birthdate
      },
    })
    await fireEvent.change(getByLabelText(/^Email/i), {
      target: {
        value: fields.email
      },
    })
    await fireEvent.change(getByLabelText(/^Phone/i), {
      target: {
        value: fields.phone
      },
    })
  })
}

/** Triggers validation that should happen after form is filled */
const triggerValidation = async ({getByLabelText, getByTestId}: RenderResult) => {
  await act(async () => {
    await fireEvent.blur(getByLabelText(/^Birthdate/i))
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
  county: 'county',
}

const nevadaAddress = {
  fullAddr: '575 W Symphony Park Ave, Las Vegas, NV 89101, USA',
  city: 'Las Vegas',
  country: 'United States',
  state: 'Nevada',
  postcode: '89101',
  county: 'Clark County',
  queryAddr: '575 W Symphony Park Ave, Las Vegas, NV 89106'
}

const nevadaContact: ContactData = {
  key: 'town:county',
  state: 'Nevada',
  city: 'town',
  county: 'county',
  faxes: ["+17024552793"]
}

test('State Form Without Signature (Wisconsin) works', async () => {
  const history = createMemoryHistory()

  const isRegistered = mocked(client, true).isRegistered = jest.fn().mockResolvedValue({
    type: 'data',
    data: {status: 'Active'},
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
  await compareResults(register, false)
})

test('State Form shows Unregistered modal warning', async () => {
  const history = createMemoryHistory()

  const isUnregistered = mocked(client, true).isRegistered = jest.fn().mockResolvedValue({
    type: 'data',
    data: {status: 'Unregistered'},
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

  const modal = renderResult.getByTestId('registrationStatusModal')

  await wait(() => expect(isUnregistered).toHaveBeenCalledTimes(1))
  expect(modal).toBeInTheDocument()
})

const useSeparateMailingAddress = async ({getByLabelText, getByTestId}: RenderResult) => {
  await act(async () => {
    const checkbox = getByLabelText(/^Mail my ballot to a different/i)
    await fireEvent.click(checkbox)
    expect(checkbox.checked).toEqual(true)

    const streetInput = getByLabelText(/^Street Address/i)
    const apartmentInput = getByLabelText(/^Apartment/i)
    const cityInput = getByLabelText(/^City/i)
    const stateInput = getByTestId('addressFieldState').firstChild
    const zipInput = getByLabelText(/^ZIP code/i)

    await fireEvent.change(streetInput, {
      target: { value: mailingAddress.street },
    })
    expect(streetInput.value).toEqual(mailingAddress.street)

    await fireEvent.change(apartmentInput, {
      target: { value: mailingAddress.unit },
    })
    expect(apartmentInput.value).toEqual(mailingAddress.unit)

    await fireEvent.change(cityInput, {
      target: { value: mailingAddress.city },
    })
    expect(cityInput.value).toEqual(mailingAddress.city)

    await fireEvent.change(stateInput, {
      target: { value: mailingAddress.state },
    })
    expect(stateInput.value).toEqual(mailingAddress.state)

    await fireEvent.change(zipInput, {
      target: { value: mailingAddress.postcode },
    })
    expect(zipInput.value).toEqual(mailingAddress.postcode)
  })
}

test('Signup Flow allows for separate mailing address', async () => {
  const history = createMemoryHistory()

  const isRegistered = mocked(client, true).isRegistered = jest.fn().mockResolvedValue({
    type: 'data',
    data: {status: 'Active'},
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
  await useSeparateMailingAddress(renderResult)
  await triggerValidation(renderResult)

  await wait(() => expect(isRegistered).toHaveBeenCalledTimes(1))
  await wait(() => expect(register).toHaveBeenCalledTimes(1))
  await compareResults(register, true)
})

test("Sends fax to Twillio successfully", async () => {
  const history = createMemoryHistory()
  const register = mocked(client, true).register = jest.fn().mockResolvedValue({
    type: 'data',
    data: 'confirmationId',
  })

  const renderResult = render(
    <Router history={history}>
      <AddressContainer.Provider initialState={nevadaAddress}>
        <ContactContainer.Provider initialState={nevadaContact}>
          <Wisconsin/>
        </ContactContainer.Provider>
      </AddressContainer.Provider>
    </Router>,
    { wrapper: UnstatedContainer }
  )

  await fillWithoutSigning(renderResult)
  await triggerValidation(renderResult)

  await wait(() => expect(register).toHaveBeenCalledTimes(1))

  const call = register.mock.calls[0][0] as StateInfo
  if(call.contact.faxes){
    await expect(isE164(call.contact.faxes[0])).toBe(true)
  }
})
