import React from 'react'
import Select from 'muicss/lib/react/select'
import Option from 'muicss/lib/react/option'
import { ImplementedState } from '../../common'
import { client } from '../../lib/trpc'
import { RoundedButton } from '../util/Button'
import { useControlRef } from '../util/ControlRef'
import { ContactContainer } from '../../lib/unstated'
import { AppForm } from '../util/Form'
import { StyledModal as RawStyledModal } from '../util/StyledModal'
import styled, { keyframes } from 'styled-components'

interface Props {
  open: boolean
  setOpen: (_: boolean) => void
  state: ImplementedState
  contactKey: string
}

const jurisdictionName = (contactKey: string) => {
  const [city, county] = contactKey.split(':')
  if (city === '') return county
  if (county === '') return city
  return `${city} (${county})`
}

// Fixes MuiCSS Select from overflowing its boundaries
const StyledSelect = styled(Select)`
  select, .mui-select__menu {
    text-transform: capitalize;
  }
  .mui-select__menu {
    top: 0 !important;
    max-height: 50vh;
  }
`

const StyledModal = styled(RawStyledModal)`
  min-height: 200px;
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
// Delays displaying content until the modal is in its appropriate position
const AfterSlideAnimation = styled.div`
  animation: ${fadeIn} ease .2s 550ms both;
`

export const ContactModal: React.FC<Props> = ({
  state,
  open,
  setOpen,
  contactKey,
}) => {
  const [contactKeys, setLocaleKeys] = React.useState<string[]>([])
  const contactRef = useControlRef<Select>()
  const { setContact } = ContactContainer.useContainer()
  const [top, setTop] = React.useState(0)
  const [left, setLeft] = React.useState(0)
  const [width, setWidth] = React.useState(0)

  // Due to CSS/HTML limitation we can't have styled Select/Options that
  // displays their content outside their boundaries. We render StyledSelect
  // on a separate div from the Modal and uses this ref to assign its position
  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const positionRef = React.useCallback((node: HTMLDivElement) => {
    setTimeout(
      () => {
        if (node !== null) {
          const all = node.getBoundingClientRect()
          console.log(all)
          setTop(node.getBoundingClientRect().top)
          setLeft(node.getBoundingClientRect().x)
          setWidth(node.getBoundingClientRect().width)
        }
      },
      // A bit after the animation duration to ensure getBoundingClientRect
      // gets everything correctly
      505,
    )
  }, [])

  React.useEffect(() => {
    (async() => {
      const result = await client.fetchContacts(state)
      if (result.type === 'data') {
        setLocaleKeys(result.data)
      }
    })()
  }, [state])

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    const newContactKey = contactRef.value()
    if (!newContactKey || newContactKey === contactKey) return
    const result = await client.getContact(state, newContactKey)
    if (result.type === 'data') {
      setContact(result.data)
      setOpen(false)
    }
  }

  return <>
    <StyledModal
      isOpen={open}
      onBackgroundClick={() => setOpen(false)}
      onEscapeKeydown={() => setOpen(false)}
    >
      <AfterSlideAnimation>
        <h4>Select Election Jurisdiction</h4>
      </AfterSlideAnimation>
      <AppForm>
        <div ref={positionRef} style={{ width: '100%' }}/>
      </AppForm>
    </StyledModal>
    {open && <AfterSlideAnimation style={{
      position: 'fixed',
      zIndex: 33,
      top, left, width,
    }}>
      <StyledSelect
        ref={contactRef}
        label='Select Jurisdiction'
        defaultValue={contactKey}
      >
        {contactKeys.sort().map((contactKey, idx) => {
          return <Option
            value={contactKey}
            key={idx}
            label={jurisdictionName(contactKey)}
          />
        })}
      </StyledSelect>
      <RoundedButton onClick={handleSubmit} color='primary'>Select</RoundedButton>
    </AfterSlideAnimation>}
  </>
}
