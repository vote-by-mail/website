import React from 'react'
import { StyledModal, AfterModalAnimation } from '../util/StyledModal'
import { Select } from '../util/Select'
import { client } from '../../lib/trpc'
import { AddressInputPartContainer } from './Container'
import { ImplementedState, addressPartsToAddress } from '../../common'
import { AddressContainer, FetchingDataContainer, ContactContainer } from '../../lib/unstated'
import { RoundedButton } from '../util/Button'
import styled from 'styled-components'
import { useAppHistory } from '../../lib/path'

interface Props {
  isOpen: boolean
  setOpen: (_: boolean) => void
}

const ContactsSelect = styled(Select)`
  select, .mui-select__menu {
    text-transform: capitalize;
  }
`

export const AddressModal: React.FC<Props> = ({ isOpen, setOpen }) => {
  const { fields } = AddressInputPartContainer.useContainer()
  const { setFetchingData } = FetchingDataContainer.useContainer()
  const { setAddress } = AddressContainer.useContainer()
  const { setContact } = ContactContainer.useContainer()
  const { pushState } = useAppHistory()
  const [ contacts, setContacts ] = React.useState<readonly string[] | undefined | null>()
  const [ newContact, setNewContact ] = React.useState<string>()
  const [ width, setWidth ] = React.useState<number | string>(0)
  const [ top, setTop ] = React.useState<number | string>(0)
  const [ left, setLeft ] = React.useState<number | string>(0)

  const state = fields.state as ImplementedState

  const fetchContacts = React.useCallback(async () => {
    setFetchingData(true)
    const resp = await client.fetchContacts(state)
    if (resp.type === 'data') setContacts(resp.data)
    setFetchingData(false)
  }, [setContacts, setFetchingData, state])

  // Loads the initial data when the modal is open for the first time
  React.useEffect(() => {
    if (isOpen && contacts === undefined) {
      fetchContacts()
    }
  }, [contacts, fetchContacts, isOpen])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.persist()
    if (newContact) {
      setFetchingData(true)
      const resp = await client.getContact(state, newContact)
      if (resp.type === 'data') {
        setContact(resp.data)
        const address = addressPartsToAddress(fields)
        address.county = resp.data.county
        setAddress(address)
        pushState(state)
        setOpen(false)
      }
      setFetchingData(false)
    }
  }

  // Due to CSS/HTML limitation we can't have styled Select/Options that
  // displays their content outside their boundaries. We render StyledSelect
  // on a separate div from the Modal and uses this ref to assign its position
  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const positionRef = React.useCallback((node: HTMLDivElement) => {
    setTimeout(
      () => {
        if (node !== null) {
          const { top, x, width} = node.getBoundingClientRect()
          setTop(top)
          setLeft(x)
          setWidth(width)
        }
      },
      // A bit after the animation duration to ensure getBoundingClientRect
      // gets everything correctly
      505,
    )
  }, [])

  return <>
    <StyledModal isOpen={isOpen}>
      <AfterModalAnimation>
        <h3>Unable to locate your Election Official</h3>
        <p>Some addresses are not covered by our Geocode API, but don&apos;t worry this just means we wont&apos;t be able to automatically find your election official.</p>
        <p>Please select your election official from the list below.</p>

        <div ref={positionRef} style={{ width: '100%', height: 67 }}/>


        <RoundedButton color='primary' onClick={handleSubmit}>
          Confirm
        </RoundedButton>
      </AfterModalAnimation>
    </StyledModal>
    {contacts && <AfterModalAnimation style={{
      position: 'fixed',
      zIndex: 33,
      top, left, width,
    }}>
      <ContactsSelect
        options={contacts}
        label='Election Official'
        optionsLabeler={o => o.replace(/:/g, '')}
        value={newContact}
        onChange={v => setNewContact(v)}
      />
    </AfterModalAnimation>}
  </>
}
