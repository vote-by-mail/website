import React from 'react'
import { render } from '@testing-library/react'
import { Success } from './Success'
import { UnstatedContainer } from './StateContainer'

test('Success page renders', () => {
  const { getByText } = render(
    <Success/>, {
    wrapper: UnstatedContainer
  })
  const h1 = getByText(/^Success!$/i)
  expect(h1).toBeInTheDocument()
})
