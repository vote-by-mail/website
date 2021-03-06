import React from 'react'

import { Arizona } from './Arizona'
import { Florida } from './Florida'
import { Georgia } from './Georgia'
import { Kansas } from './Kansas'
import { Maine } from './Maine'
import { Maryland } from './Maryland'
import { Massachusetts } from './Massachusetts'
import { Michigan } from './Michigan'
import { Minnesota } from './Minnesota'
import { Nebraska } from './Nebraska'
import { Nevada } from './Nevada'
import { NewHampshire } from './NewHampshire'
import { NewYork } from './NewYork'
import { NorthCarolina } from './NorthCarolina'
import { NorthDakota } from './NorthDakota'
import { Oklahoma } from './Oklahoma'
import { Virginia } from './Virginia'
import { WestVirginia} from './WestVirginia'
import { Wisconsin } from './Wisconsin'
import { Wyoming } from './Wyoming'
import { AddressContainer, ContactContainer } from '../../lib/unstated'
import { Locale, isImplementedLocale, ContactMethod, ImplementedState, primaryEligible } from '../../common'
import { useAppHistory } from '../../lib/path'
import { InvalidContact } from '../contact/InvalidContact'
import { StyledPanel } from '../util/Panel'
import { VbmAdjective, VbmNoun } from '../util/VbmWord'


type SwitchProps = React.PropsWithChildren<{
  locale: Locale<ImplementedState>
}>

const StateFormSwitch: React.FC<SwitchProps> = ({
  locale,
}) => {
  switch(locale.state) {
    case 'Arizona': return <Arizona />
    case 'Florida': return <Florida />
    case 'Georgia': return <Georgia />
    case 'Kansas': return <Kansas />
    case 'Maine': return <Maine />
    case 'Maryland': return <Maryland />
    case 'Massachusetts': return <Massachusetts />
    case 'Minnesota': return <Minnesota />
    case 'Michigan': return <Michigan />
    case 'Nebraska': return <Nebraska />
    case 'Nevada': return <Nevada />
    case 'New Hampshire': return <NewHampshire />
    case 'New York': return <NewYork />
    case 'North Carolina': return <NorthCarolina />
    case 'North Dakota': return <NorthDakota />
    case 'Oklahoma': return <Oklahoma />
    case 'Virginia': return <Virginia />
    case 'West Virginia': return <WestVirginia />
    case 'Wisconsin': return <Wisconsin />
    case 'Wyoming': return <Wyoming />
  }
}

const methodExplain = (method: ContactMethod) => {
  const email = <>We will email the <VbmAdjective/> signup to your local election official and to you.</>
  const fax = <>We will fax the <VbmAdjective/> signup to your local election official and email a copy to you.</>
  switch(method.stateMethod) {
    case 'email': return email
    case 'fax': return fax
    case 'fax-email': return (method.emails.length > 0) ? email : fax
  }
}

interface Props {
  ignoreError?: boolean
}

export const StateForm: React.FC<Props> = ({ignoreError}) => {
  const { address, locale } = AddressContainer.useContainer()
  const { contact, method } = ContactContainer.useContainer()
  const { path, pushAddress, pushStartSection } = useAppHistory()

  // if we do not have locale or address data, go back
  if (!locale || !address) {
    if (ignoreError) return null
    if (!path) {
      pushStartSection('start')
    } else if (path.type === 'state') {
      pushAddress(path.state)
    } else {
      pushStartSection('start')
    }
    return null
  }

  // if we do not have contact or method data, we just cannot find a contact
  if (!contact || !method) {
    if (ignoreError) return null
    return <InvalidContact locale={locale} contact={contact}/>
  }

  // unlikely cases, caught mostly for type checking
  if (locale.state !== contact.state) {
    if (ignoreError) return null
    throw Error(`Locale state ${locale.state} does not match ${contact.state}`)
  }
  if (!isImplementedLocale(locale)) {
    if (ignoreError) return null
    throw Error(`Locale state ${locale.state} is not implemented`)
  }

  const forGeneral = primaryEligible(locale.state) ? '' : ' for the general election'

  return <>
    <h1 style={{ textTransform: 'capitalize' }}>
      {locale.state} <VbmAdjective/> Signup Form
    </h1>
    <p>
      Fill out the following form to sign up for <VbmNoun/>{forGeneral}.  {methodExplain(method)}
    </p>
    <StyledPanel>
      <StateFormSwitch locale={locale}/>
    </StyledPanel>
  </>
}
