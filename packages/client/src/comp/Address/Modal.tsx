import React from 'react'
import { StyledModal } from '../util/StyledModal'
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

  return <StyledModal isOpen={isOpen}>
    <h3>Unable to locate your Election Official</h3>
    <p>Some addresses are not covered by our Geocode API, but don&apos;t worry this just means we wont&apos;t be able to automatically find your election official.</p>
    <p>In order to continue, please select your election official from the list below.</p>

    {contacts && (
      <ContactsSelect
        options={contacts}
        label='Election Official'
        optionsLabeler={o => o.replace(/:/g, '')}
        value={newContact}
        onChange={v => setNewContact(v)}
      />
    )}

    <RoundedButton color='primary' onClick={handleSubmit}>
      Confirm
    </RoundedButton>
  </StyledModal>
}
