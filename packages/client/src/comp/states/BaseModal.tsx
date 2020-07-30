import React from 'react'
import { StyledModal } from '../util/StyledModal'
import { BaseRegistrationStatus } from './BaseRegistration'
import { RoundedButton } from '../util/Button'
import styled from 'styled-components'

interface Props {
  isOpen: boolean
  setIsOpen: (_: boolean) => void
  modalContext: 'click' | 'formSubmit'
  handleSubmit: (_?: React.FormEvent<HTMLFormElement>) => Promise<void>
  registrationStatus: BaseRegistrationStatus
  setIgnoreRegistrationStatus: (_: boolean) => void
}

const P = styled.div`
  /* Allows newlines to be rendered without the need of <br> or new <p> */
  white-space: pre-wrap;
  margin-bottom: 25px;
`

const statusMessage = (registrationStatus: BaseRegistrationStatus) => {
  const doubleCheck = '\nPlease double check your name, address, and birthdate.  Our data is may be slightly out of date so if you are reasonably sure that the registration information you entered is correct, please ignore this warning.'

  switch (registrationStatus) {
    case 'Active':
return 'Based on our search of public records, you are currently registered to vote at this address.'
    case 'Error':
return `Error while checking your registration status.
${doubleCheck}`

    default:
return `Based on our search of public records, you are not currently registered to vote at this address.
${doubleCheck}`
  }
}

export const BaseModal: React.FC<Props> = ({
  isOpen,
  setIsOpen,
  registrationStatus,
  setIgnoreRegistrationStatus,
  handleSubmit,
  modalContext,
}) => {
  return <StyledModal
    isOpen={isOpen}
    data-testid='registrationStatusModal'
  >
    <h4>Unconfirmed Registration Status</h4>
    <P>{statusMessage(registrationStatus)}</P>
    <RoundedButton
      color='white'
      style={{ marginRight: 10 }}
      onClick={() => {
        setIgnoreRegistrationStatus(true)
        if (modalContext === 'formSubmit') {
          handleSubmit()
        }
        setIsOpen(false)
      }}
    >
      {modalContext === 'formSubmit' ? 'Sign Up Anyway' : 'Ignore Warning'}
    </RoundedButton>
    <RoundedButton color='primary' onClick={() => {
      setIsOpen(false)
      setIgnoreRegistrationStatus(false)
    }}>
      Recheck Fields
    </RoundedButton>
  </StyledModal>
}
