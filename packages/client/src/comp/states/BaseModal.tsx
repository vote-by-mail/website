import React from 'react'
import { StyledModal } from '../util/StyledModal'
import { BaseRegistrationStatus } from './BaseRegistration'
import { RoundedButton } from '../util/Button'

interface Props {
  isOpen: boolean
  setIsOpen: (_: boolean) => void
  modalContext: 'click' | 'formSubmit'
  handleSubmit: (_?: React.FormEvent<HTMLFormElement>) => Promise<void>
  registrationStatus: BaseRegistrationStatus
  setIgnoreRegistrationStatus: (_: boolean) => void
}

const statusMessage = (registrationStatus: BaseRegistrationStatus) => {
  switch (registrationStatus) {
    case 'Error': return 'Error while checking your registration status.'

    default: return 'Based on our search of public records, you are not currently registered to vote at this address.'
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
    <p>{statusMessage(registrationStatus)}</p>
    <p style={{ marginBottom: 25 }}>
      Please double check your name, address, and birthdate.  If you are reasonably sure that the registration information entered above is correct (our data might be slightly out of date), please ignore this warning.
    </p>
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
      {modalContext === 'formSubmit' ? 'Sign up anyway' : 'Ignore Warning'}
    </RoundedButton>
    <RoundedButton color='primary' onClick={() => {
      setIsOpen(false)
      setIgnoreRegistrationStatus(false)
    }}>
      Recheck Fields
    </RoundedButton>
  </StyledModal>
}
