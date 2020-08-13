import React from 'react'
import { render, fireEvent, act, wait } from '@testing-library/react'
import { WarningMsg } from './WarningMsg'
import { UnstatedContainer } from "./StateContainer"
import { MemoryRouter } from 'react-router-dom'
import { Initialize } from './Initialize'
import { mocked } from 'ts-jest/utils'
import { client } from '../lib/trpc'
jest.mock('../lib/trpc.ts')
jest.mock('../lib/analytics.ts')

const renderResult = async () => {
  const utmFields = {
    utm_source: 'source1234',      //eslint-disable-line @typescript-eslint/camelcase
    utm_medium: 'medium1234',      //eslint-disable-line @typescript-eslint/camelcase
    utm_campaign: 'campaign1234',  //eslint-disable-line @typescript-eslint/camelcase
    utm_term: 'term1234',          //eslint-disable-line @typescript-eslint/camelcase
    utm_content: 'content1234',    //eslint-disable-line @typescript-eslint/camelcase
  }

  const params = Object.entries(utmFields).map(([key, val]) => `${key}=${val}`).join('&')

  const initialData = mocked(client, true).fetchInitialData = jest.fn().mockResolvedValue({
    type: 'data',
    data: { emailFaxOfficials: false, org: {} },
  })

  const rendered = render(
    // Using MemoryRouter is recommended way to test react-router-dom
    // https://reacttraining.com/react-router/web/guides/testing
    <MemoryRouter initialEntries={['/org/default?' + params]}>
      <Initialize/>
      <WarningMsg/>
    </MemoryRouter>,
    { wrapper: UnstatedContainer },
  )

  await act(async () => {
    await wait(() => expect(initialData).toHaveBeenCalledTimes(1))
  })

  return rendered
}

// When visiting the page for the first time

test('Modal shows by default when visiting the page for the first time', async () => {
  localStorage.removeItem('visited')

  const rendered = await renderResult()

  const modal = rendered.getByTestId('notProductionModal')

  expect(modal).toBeInTheDocument()
})
test('Dismissing the modal triggers a toast when visiting the page for the first time', async () => {
  localStorage.removeItem('visited')

  const rendered = await renderResult()

  const dismissButton = rendered.getByTestId('notProductionButton')

  await act(async () => {
    await fireEvent.click(dismissButton)
    // The modal has a small delay to hide due to its animations
    await new Promise(r => setTimeout(() => r(), 800))
  })

  const toast = rendered.getByText('You can toggle this popup again by clicking on "Not Production" at the bottom right corner of the page.')

  expect(toast).toBeInTheDocument()
})

// When visiting the page again

test('Modal doesn\'t show by default when visiting the page again', async () => {
  localStorage.setItem('visited', 'true')

  const rendered = await renderResult()

  const modal = rendered.queryByTestId('notProductionModal')

  expect(modal).toBe(null)
})

test('Dismissing the modal doesn\'t trigger toasts when visiting the page again', async () => {
  localStorage.setItem('visited', 'true')

  const rendered = await renderResult()

  const dismissButton = rendered.getByTestId('notProductionButton')

  await act(async () => {
    await fireEvent.click(dismissButton)
    // The modal has a small delay to hide due to its animations
    await new Promise(r => setTimeout(() => r(), 800))
  })

  const toast = rendered.queryByText('You can toggle this popup again by clicking on "Not Production" at the bottom right corner of the page.')

  expect(toast).toBe(null)
})
