import React from 'react'
import { Blurb } from './Blurb'
import { UnstatedContainer } from './StateContainer'
import { render } from '@testing-library/react'

test('BlurbForm works', async() => {
  const { getByTestId } = render(
    <Blurb/>,
    { wrapper: UnstatedContainer }
  )

  const linkElement = getByTestId('blurb-call-to-action')
  expect(linkElement).toBeInTheDocument()
})
