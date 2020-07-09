import React from 'react'
import Checkbox from 'muicss/lib/react/checkbox'
import { CheckboxProps } from 'muicss/react'
import styled from 'styled-components'

import { Red } from './Util'

/** Fixes the vertical displacement of its label */
export const FixedCheckbox = styled(Checkbox)`
  label {
    display: flex;
    align-items: center;
    input[type="checkbox"] {
      margin-top: 1px;
    }
  }
`

export const AppCheckbox = React.forwardRef<Checkbox, CheckboxProps>(function AppCheckbox(props, ref) {
  return <FixedCheckbox
    {...props}
    label={<span>{props.label} {props.required ? <Red>*</Red> : null}</span>}
    ref={ref}
  />
})
