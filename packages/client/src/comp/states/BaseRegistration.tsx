import React from 'react'
import { RegistrationStatus } from '../../common'
import styled from 'styled-components'

const I = styled.i`
  color: var(--primary);
  &:hover { cursor: help; }
`

const MarginSpan = styled.span`
  display: block;
  margin-bottom: 20px;
`

const Red = styled.span`
  color: var(--danger);
`

export type BaseRegistrationStatus = RegistrationStatus | 'Error' | 'Loading'

interface Props {
  registrationStatus: BaseRegistrationStatus
  ignoreRegistrationStatus: boolean
  onClick: VoidFunction
}

export const BaseRegistration: React.FC<Props> = ({
  ignoreRegistrationStatus,
  registrationStatus,
  onClick,
}) => {
  if (registrationStatus === null) return null

  if (ignoreRegistrationStatus) return <MarginSpan>
    <b>Voter Registration:</b> Ignored <I className="fa fa-question-circle" onClick={onClick}/>
  </MarginSpan>

  if (registrationStatus === 'Loading') return <MarginSpan>
    <b>Voter Registration:</b> Loading <i className="fa fa-spinner fa-spin"/>
  </MarginSpan>

  if (registrationStatus === 'Active') return <MarginSpan>
    <b>Voter Registration:</b> Active <i style={{ color: '#4caf50' }} className="fa fa-check"/>
  </MarginSpan>

  return <MarginSpan>
    <b>Voter Registration:</b> <Red>{registrationStatus}</Red> <I className="fa fa-question-circle" onClick={onClick}/>
  </MarginSpan>
}
