import React from 'react'
import { ContactData, Locale, ImplementedState, formatPhoneNumber } from '../../common'
import styled from 'styled-components'
import { ContactModal } from './ContactModal'


type Props = React.PropsWithChildren<{
  locale: Locale<ImplementedState>
  contact: ContactData
}>

const ContacStyle = styled.div`
  margin-bottom: 20px;
`

const SmallSpacing = styled.div`
  margin-bottom: 4px;
`

const StyledP = styled.p`
  color: var(--primary);
  margin: 0;
  &:hover {
    text-decoration: underline;
  }
`

const ContactField: React.FC<{name: string, val?: string}> = ({name, val}) => {
  if (!val) return null
  return <SmallSpacing><b>{name}:</b> {val}</SmallSpacing>
}

const ContactFields: React.FC<{name: string, val?: string[]}> = ({name, val}) => {
  if (!val || val.length === 0) return null
  return <ContactField name={name} val={val.join(', ')}/>
}

export const ContactInfo: React.FC<Props> = ({
  locale, contact
}) => {
  const [open, setOpen] = React.useState<boolean>(false)

  // New York state has two election officials, which does not match our data format
  // Since they are (usually?) a democrat and a republican, only displaying one appears partisan.
  // Not displaying NY at their request.
  const displayOfficial = locale.state !== 'New York'

  return <ContacStyle>
    <p><b>Local Election Official Details.</b></p>
    { displayOfficial ? <ContactField name='Official' val={contact.official}/> : null }
    <ContactField name='City' val={contact.city}/>
    <ContactField name='County' val={contact.county}/>
    <ContactFields name='Email' val={contact.emails}/>
    <ContactFields name='Fax' val={contact.faxes && contact.faxes.map(formatPhoneNumber)}/>
    <ContactFields name='Phone' val={contact.phones && contact.phones.map(formatPhoneNumber)}/>
    <SmallSpacing><small>
      <StyledP onClick={() => setOpen(true)}>Wrong Election Official?</StyledP>
    </small></SmallSpacing>

    <ContactModal
      open={open}
      setOpen={setOpen}
      state={locale.state}
      contactKey={contact.key}
    />
  </ContacStyle>
}
