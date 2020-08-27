import React from 'react'
import { StyledModal, AfterModalAnimation } from '../util/StyledModal'
import { Select, SelectOptions } from '../util/Select'
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

export const AddressGeocodeErrorModal: React.FC<Props> = ({ isOpen, setOpen }) => {
  const { fields, streetNumbers } = AddressInputPartContainer.useContainer()
  const { setFetchingData } = FetchingDataContainer.useContainer()
  const { address, setAddress } = AddressContainer.useContainer()
  const { contact, setContact } = ContactContainer.useContainer()
  const { pushState } = useAppHistory()

  const [ contacts, setContacts ] = React.useState<SelectOptions | null>(null)
  const [ newContact, setNewContact ] = React.useState<string>()
  const [ streetNumber, setStreetNumber ] = React.useState<string | undefined>()

  // Used to imperatively position <Select/> for election officials
  const [ width, setWidth ] = React.useState<number | string>(0)
  const [ top, setTop ] = React.useState<number | string>(0)
  const [ left, setLeft ] = React.useState<number | string>(0)

  const state = fields.state as ImplementedState

  const fetchContacts = React.useCallback(async () => {
    setFetchingData(true)
    const resp = await client.fetchContacts(state)
    if (resp.type === 'data') {
      setContacts(resp.data)
      setNewContact(resp.data[0])
    }
    setFetchingData(false)
  }, [setContacts, setFetchingData, state])

  React.useEffect(() => {
    // Loads the initial data when the modal is open for the first time
    if (isOpen && !contacts) {
      fetchContacts()
    }
    // Assigns the default value for streetNumber if possible
    if (isOpen && !streetNumber && streetNumbers) {
      setStreetNumber(streetNumbers[0])
    }
  }, [streetNumbers, streetNumber, address, contacts, fetchContacts, isOpen])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.persist()
    const address = addressPartsToAddress(fields)

    if (streetNumber) {
      address.streetNumber = streetNumber
    }

    if (newContact) {
      setFetchingData(true)
      const resp = await client.getContact(state, newContact)
      if (resp.type === 'data') {
        setContact(resp.data)
        address.county = resp.data.county
        setAddress(address)
      }
      setFetchingData(false)
    }

    pushState(state)
    setOpen(false)
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

  // Returns true when this modal needs to solve both the lack of street
  // number and of election official
  const bothErrors = !contact && !address?.streetNumber

  return <>
    <StyledModal isOpen={isOpen}>
      <AfterModalAnimation>
        <h3>Geocode API Failed</h3>
        <p>Please confirm or change the information below.</p>

        <div
          ref={positionRef}
          // Height is either the height of one or two <Select/>
          style={{ width: '100%', height: bothErrors ? 134 : 67 }}
        />

        <RoundedButton color='primary' onClick={handleSubmit}>
          Confirm
        </RoundedButton>
      </AfterModalAnimation>
    </StyledModal>
    <AfterModalAnimation style={{
      position: 'fixed',
      zIndex: 33,
      top, left, width,
    }}>
      {contacts && <ContactsSelect
        options={contacts}
        label='Election Official'
        optionsLabeler={o => o.replace(/:/g, '')}
        value={newContact}
        onChange={v => setNewContact(v)}
      />}
      {streetNumbers && streetNumbers.length > 1 && <Select
        options={streetNumbers}
        label='Street number'
        value={streetNumber}
        onChange={v => setStreetNumber(v)}
      />}
    </AfterModalAnimation>
  </>
}
