import React from 'react'
import { Blurb } from './Blurb'
import { UnstatedContainer } from './StateContainer'
import { render } from '@testing-library/react'

test('BlurbForm works', async() => {
  const { getByText } = render(
    <Blurb/>,
    { wrapper: UnstatedContainer }
  )

  const linkElement = getByText(/^Enter the ZIP code where you are registered to vote\.$/i)
  expect(linkElement).toBeInTheDocument()
})
