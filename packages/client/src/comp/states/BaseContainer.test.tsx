import React from 'react'
import { render } from '@testing-library/react'
jest.mock('react-signature-canvas')

import { UnstatedContainer } from "../StateContainer"
import { MemoryRouter } from 'react-router-dom'
import { ContactData } from '../../common'
import { AddressContainer, ContactContainer } from '../../lib/unstated'
import { Wisconsin } from './Wisconsin'
import { client } from '../../lib/trpc'
import { mocked } from 'ts-jest/utils'
jest.mock('../../lib/trpc')

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

const baseUrl = '/org/default?'
const params = {
  firstName: 'George',
  lastName: 'Washington',
  // To test mm-dd-yyyy to mm/dd/yyyy conversion
  birthdate: '02-22-1732',
  normalizedBirthdate: '02/22/1732',
  email: 'washinton@gmail.com',
}
const urlWithQuery = baseUrl + Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&')

test('Loads values from query (url params) by default', () => {
  mocked(client, true).fetchInitialData = jest.fn().mockResolvedValue({})
  mocked(client, true).fetchContacts = jest.fn().mockResolvedValue([])

  const rendered = render(
    <MemoryRouter initialEntries={[urlWithQuery]}>
      <AddressContainer.Provider initialState={wisconsinAddress}>
        <ContactContainer.Provider initialState={wisconsinContact}>
          <Wisconsin/>
        </ContactContainer.Provider>
      </AddressContainer.Provider>
    </MemoryRouter>,
    { wrapper: UnstatedContainer },
  )

  expect(rendered.getByDisplayValue(params.firstName)).toBeInTheDocument()
  expect(rendered.getByDisplayValue(params.lastName)).toBeInTheDocument()
  expect(rendered.getByDisplayValue(params.normalizedBirthdate)).toBeInTheDocument()
  expect(rendered.getByDisplayValue(params.email)).toBeInTheDocument()
})
