import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { WarningMsg } from './WarningMsg'
import { UnstatedContainer } from "./StateContainer"
import { InitialDataContainer } from '../lib/unstated'

const renderResult = () => render(
  <InitialDataContainer.Provider initialState={{ emailFaxOfficials: false, org: {} }}>
    <WarningMsg/>
  </InitialDataContainer.Provider>,
  { wrapper: UnstatedContainer },
)

// When visiting the page for the first time

test('Modal shows by default when visiting the page for the first time', () => {
  localStorage.removeItem('visited')

  const rendered = renderResult()

  const modal = rendered.getByTestId('notProductionModal')

  expect(modal).toBeInTheDocument()
})
test('Dismissing the modal triggers a toast when visiting the page for the first time', async () => {
  localStorage.removeItem('visited')

  const rendered = renderResult()

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

test('Modal doesn\'t show by default when visiting the page again', () => {
  localStorage.setItem('visited', 'true')

  const rendered = renderResult()

  const modal = rendered.queryByTestId('notProductionModal')

  expect(modal).toBe(null)
})

test('Dismissing the modal doesn\'t trigger toasts when visiting the page again', async () => {
  localStorage.setItem('visited', 'true')

  const rendered = renderResult()

  const dismissButton = rendered.getByTestId('notProductionButton')

  await act(async () => {
    await fireEvent.click(dismissButton)
    // The modal has a small delay to hide due to its animations
    await new Promise(r => setTimeout(() => r(), 800))
  })

  const toast = rendered.queryByText('You can toggle this popup again by clicking on "Not Production" at the bottom right corner of the page.')

  expect(toast).toBe(null)
})
