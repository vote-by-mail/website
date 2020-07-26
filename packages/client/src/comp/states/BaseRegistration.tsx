import React from 'react'
import { RegistrationStatus } from '../../common'
import styled from 'styled-components'

const I = styled.i`
  color: var(--primary);
  &:hover { cursor: help; }
`

const Red = styled.span`
  color: var(--danger);
`

export type BaseRegistrationStatus = RegistrationStatus | 'Error' | 'Ignored' | 'Loading'

interface Props {
  registrationStatus: BaseRegistrationStatus
  setIsOpen: (_: boolean) => void
}

export const BaseRegistration: React.FC<Props> = ({ registrationStatus, setIsOpen }) => {
  if (registrationStatus === null) return null

  if (registrationStatus === 'Loading') return <>
    <b>Voter Registration:</b> Loading <i className="fa fa-spinner fa-spin"/>
  </>
  if (registrationStatus === 'Active') return <>
    <b>Voter Registration:</b> Active <i style={{ color: '#4caf50' }} className="fa fa-check"/>
  </>
  if (registrationStatus === 'Ignored') return <>
    <b>Voter Registration:</b>{' '}
    Ignored{' '}
    <I className="fa fa-question-circle" onClick={() => setIsOpen(true)}/>
  </>
  return <>
    <b>Voter Registration:</b>{' '}
    <Red>{registrationStatus === 'Error' ? 'Error' : 'Invalid'}</Red>{' '}
    <I className="fa fa-question-circle" onClick={() => setIsOpen(true)}/>
  </>
}
