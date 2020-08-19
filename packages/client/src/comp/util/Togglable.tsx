import React from 'react'
import { CheckboxProps } from 'muicss/react'
import { createContainer } from 'unstated-next'
import styled from 'styled-components'
import { AppCheckbox } from './Checkbox'

const useCheckbox = (init = false) => {
  const [checked, setCheck] = React.useState<boolean>(init)
  const toggleCheck = () => setCheck(!checked)
  return { checked, toggleCheck }
}
const CheckboxContainer = createContainer(useCheckbox)

// To allow a custom onChange based on the boolean onChecked change
interface BaseProps extends Omit<CheckboxProps, 'onChange'> {
  children: (checked: boolean) => React.ReactNode
}

type Props = BaseProps & { onChange?: (value: boolean) => void }

const Wrapper = styled.div`
  padding-top: 15px;
  margin-bottom: 20px;
`

const RawTogglable: React.FC<Props> = ({children, onChange, ...props}) => {
  const { checked, toggleCheck } = CheckboxContainer.useContainer()

  // Using React.useEffect to call this component props.onChange after
  // after AppCheckbox.onChange, providing the desired result since when
  // this prop is provided we're most likely wanting to perform calculations
  // with the new value of checked
  React.useEffect(() => {
    if (onChange) onChange(checked)
  }, [checked, onChange])

  // Matching style of input fields
  return <Wrapper>
    <AppCheckbox
      {...props}
      checked={checked}
      onChange={toggleCheck}
    />
    {(checked && children) && children(checked)}
  </Wrapper>
}

export const Togglable: React.FC<Props> = (props) => {
  return <CheckboxContainer.Provider initialState={props.checked || false}>
    <RawTogglable {...props}/>
  </CheckboxContainer.Provider>
}
