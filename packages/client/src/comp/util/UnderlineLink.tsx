import styled from 'styled-components'
import { Link } from 'react-router-dom'

/**
 * Creates an HTML Anchor element where its underline is padded by a few
 * pixels from the text.
 */
export const UnderlineLink = styled(Link)`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 12px;
  padding-bottom: 0.2em;
  border-bottom: 2px solid var(--primary);
  &:hover {
    text-decoration: none;
  }
`
