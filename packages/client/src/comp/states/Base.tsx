import React from 'react'
import Input from 'muicss/lib/react/input'

import { BaseInfo, StateInfo, isImplementedLocale, SignatureType, RegistrationStatus } from '../../common'
import { client } from '../../lib/trpc'
import { RoundedButton } from '../util/Button'
import { useControlRef } from '../util/ControlRef'
import { BaseInput, PhoneInput, EmailInput, NameInput, BirthdateInput } from '../util/Input'
import { Togglable } from '../util/Togglable'
import { useAppHistory } from '../../lib/path'
import { Signature } from '../util/Signature'
import { AddressContainer, VoterContainer, ContactContainer, FetchingDataContainer } from '../../lib/unstated'
import { ContactInfo } from '../contact/ContactInfo'
import { AppForm } from '../util/Form'
import { Center } from '../util/Util'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { StyledModal } from '../util/StyledModal'

export type StatelessInfo = Omit<BaseInfo, 'state'>

type EnrichValues<Info> = (base: StatelessInfo) => Info | null

type Props<Info> = React.PropsWithChildren<{
  enrichValues: EnrichValues<Info>
}>

const datePattern = /^([0-3]\d{1})\/((0|1|2)\d{1})\/((19|20)\d{2})/
// eslint-disable-next-line no-useless-escape
const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const telephonePattern = /[0-9]{3}-?[0-9]{3}-?[0-9]{4}/

const NameWrapper = styled.div`
  display: flex;
  .mui-textfield {
    flex: 1;
    &:nth-child(1) { margin-right: 15px; }
  }
`

const hasSpace = (s: string | null) => {
  return (s?.indexOf(' ') ?? -1) !== -1
}

type InputId =
  | 'birthdate'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'telephone'

type ExtendedStatus = RegistrationStatus | 'Error' | 'Ignored' | 'Not Found'

/**
 * this works with redirect urls of the form
 * /#/org/default/state?registrationAddress=100%20S%20Biscayne%20Blvd,%20Miami,%20FL%2033131&name=George%20Washington&birthdate=1945-01-01&email=george@us.gov&telephone=212-111-1111
 */
export const Base = <Info extends StateInfo>({ enrichValues, children }: Props<Info>) => {
  const { pushSuccess, oid, query } = useAppHistory()
  const { address, locale } = AddressContainer.useContainer()
  const { contact } = ContactContainer.useContainer()
  const { voter } = VoterContainer.useContainer()
  const { fetchingData, setFetchingData } = FetchingDataContainer.useContainer()
  const [ registrationStatus, setRegistrationStatus ] = React.useState<ExtendedStatus>(null)

  const [ validFirstName, setValidFirstName ] = React.useState(false)
  const [ validLastName, setValidLastName ] = React.useState(false)
  const [ validBirthdate, setValidBirthdate ] = React.useState(false)
  const [ validEmail, setValidEmail ] = React.useState(false)
  const [ validPhone, setValidPhone ] = React.useState(true)
  const validInputs = () => (
    validFirstName && validLastName && validBirthdate && validEmail && validPhone
  )

  const firstNameRef = useControlRef<Input>()
  const lastNameRef = useControlRef<Input>()
  const birthdateRef = useControlRef<Input>()
  const emailRef = useControlRef<Input>()
  const phoneRef = useControlRef<Input>()
  const mailingRef = useControlRef<Input>()
  if (!locale || !isImplementedLocale(locale) || !contact) return null

  const uspsAddress = address ? address.fullAddr : null
  const { city, county, otherCities, latLong } = locale

  const stateInfo = (forRegistrationStatus: boolean): StateInfo | null => {
    if (!address || !uspsAddress || !contact) {
      toast.error('Please fill all the required fields')
      return null
    }

    const base: StatelessInfo = {
      city: contact.city ?? city,
      county: contact.county ?? county,
      otherCities,
      latLong,
      oid,
      name: `${firstNameRef.value()} ${lastNameRef.value()}` || '',
      birthdate: birthdateRef.value() || '',
      email: emailRef.value() || '',
      mailingAddress: mailingRef.value() || '',
      phone: phoneRef.value() || '',
      uspsAddress,
      contact,
      address,
    }

    const info = enrichValues(
      // Small hack to prevent SignatureBase toasting missing signatures
      !forRegistrationStatus ? base : {...base, signature: 'skip'}
    )

    if (!info) {
      // Do not dismiss previous errors which may give more details on bad fields
      toast.error('Please fill all the required fields in the right formats')
    }

    return info
  }

  /**
   * Detects the content of all inputs needed for checking voter registration.
   * When possible, this function will contact the server, updating `registrationStatus`
   * when finished.
   *
   * @param fromBlur Helps us perform more intensive checks only when the input
   * lose focus.
   */
  async function onChange(
    e: React.ChangeEvent<HTMLInputElement>,
    fromBlur: boolean,
  ) {
    e.preventDefault()
    e.persist() // allow async function call

    // Helps avoid creating several onChange functions for each field
    const triggeredBy = e.target.id as InputId

    // Triggered by a field directly related to registrationStatus
    const aboutRegistration =
      triggeredBy === 'birthdate'
      || triggeredBy === 'firstName'
      || triggeredBy === 'lastName'

    switch (triggeredBy) {
      case 'birthdate':
        // We don't reset registration status here because Alloy doesn't
        // really need birthdates to work
        if (birthdateRef.current?.controlEl) {
          // Removes non-numbers and replaces '-' with '/'
          birthdateRef.current.controlEl.value = e.currentTarget.value.replace(
            '-',
            '/',
          )
          birthdateRef.current.controlEl.value = e.currentTarget.value.replace(
            /[^(0-9)|(/).]/g,
            '',
          )

          setValidBirthdate(datePattern.test(birthdateRef.value() ?? ''))
        }
        break

      case 'firstName':
      case 'lastName': {
        const isFirstName = triggeredBy === 'firstName'
        // Reset registration status if name changes
        setRegistrationStatus(!fromBlur ? null : registrationStatus)
        // Check if the user has typed more than one name in a single field
        const valid = !hasSpace(
          isFirstName ? firstNameRef.value() : lastNameRef.value()
        )

        if (isFirstName) setValidFirstName(valid)
        else setValidLastName(valid)

        if (!valid && fromBlur && e.currentTarget.value) {
          toast.warning(
            `Please type only your ${isFirstName ? 'first' : 'last'} name and with no spaces.`
          )
        }
      } break

      case 'email':
        if (emailRef.current?.controlEl) {
          const valid = emailPattern.test(emailRef.value() ?? '')
          setValidEmail(valid)
          if (fromBlur && !valid && e.currentTarget.value) {
            toast.warning('Please make sure to enter a valid email')
          }
        }
        break

      case 'telephone':
        if (phoneRef.current?.controlEl) {
          if (e.currentTarget.value) {
            const valid = telephonePattern.test(phoneRef.value() ?? '')
            setValidPhone(valid)
            if (fromBlur && !valid) {
              toast.warning('Please make sure to enter a valid phone number')
            }
          } else {
            setValidPhone(true)
          }
        }
        break
    }

    const canCheckRegistration = validFirstName && validLastName && validBirthdate
    if (fromBlur && canCheckRegistration && aboutRegistration) {
      if (registrationStatus !== 'Ignored' && registrationStatus !== 'Active') {
        const info = stateInfo(true)
        if (!info) return
        setFetchingData(true)

        const result = await client.isRegistered(info)
        if (result.type === 'data') {
          setRegistrationStatus(result.data ?? 'Not Found')
        } else {
          setRegistrationStatus('Error')
        }

        setFetchingData(false)
      }
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.persist()  // allow async function call
    event.preventDefault()

    const info = stateInfo(false)
    if (!info) return

    setFetchingData(true)
    const result = await client.register(info, voter)
    if(result.type === 'data'){
      pushSuccess(result.data)
    } else {
      toast.error('Error signing up.  Try resubmitting.  If this persists, try again in a little while.')
    }
    setFetchingData(false)
  }

  return <AppForm onSubmit={handleSubmit}>
    <NameWrapper>
      <NameInput
        id='firstName'
        label='First Name'
        ref={firstNameRef}
        defaultValue={query.name}
        onChange={e => onChange(e, false)}
        onBlur={e => onChange(e, true)}
        required
      />
      <NameInput
        id='lastName'
        label='Last Name'
        ref={lastNameRef}
        defaultValue={query.name}
        onChange={e => onChange(e, false)}
        onBlur={e => onChange(e, true)}
        required
      />
    </NameWrapper>
    <BaseInput
      id='registrationAddress'
      label='Voter Registration Address'
      defaultValue={address?.queryAddr}
      disabled
    />
    <ContactInfo locale={locale} contact={contact}/>
    <BirthdateInput
      id='birthdate'
      ref={birthdateRef}
      defaultValue={query.birthdate}
      onChange={e => onChange(e, false)}
      onBlur={e => onChange(e, true)}
      required
    />
    <EmailInput
      id='email'
      ref={emailRef}
      defaultValue={query.email}
      onChange={e => onChange(e, false)}
      onBlur={e => onChange(e, true)}
      required
    />
    <PhoneInput
      id='telephone'
      ref={phoneRef}
      defaultValue={query.telephone}
      onChange={e => onChange(e, false)}
      onBlur={e => onChange(e, true)}
    />
    <Togglable
      id='mailing'
      label='Mail my ballot to a different address than listed above'
    >{
      (checked) => <BaseInput
        id='mailing'
        label='Mailing Address'
        ref={mailingRef}
        required={checked}
      />
    }</Togglable>
    { children }
    <Center>
      <RoundedButton
        color='primary'
        variant='raised'
        data-testid='submit'
        disabled={
          fetchingData
          || (registrationStatus !== 'Active' && registrationStatus !== 'Ignored')
          || !validInputs()
        }
      >
        Submit signup
      </RoundedButton>
    </Center>

    <StyledModal
      isOpen={
        registrationStatus !== null && registrationStatus !== 'Ignored' && registrationStatus !== 'Active'
      }
    >
      <h4>Unconfirmed Registration Status</h4>
      <p>
      {
        registrationStatus !== 'Error'
        ? <>
          Based on our search of public records, you are not currently registered to vote at this address.
        </>
        : <>
          Error while checking your registration status.
        </>
      }
      </p>
      <p style={{ marginBottom: 25 }}>
        Please double check your name, address, and birthdate.  If you are reasonably sure that the registration information entered above is correct (our data might be slightly out of date), please ignore this warning.
      </p>
      <RoundedButton
        color='white'
        style={{ marginRight: 10 }}
        onClick={() => setRegistrationStatus('Ignored')}
      >
        Ignore Warning
      </RoundedButton>
      <RoundedButton color='primary' onClick={() => setRegistrationStatus(null)}>
        Recheck Fields
      </RoundedButton>
    </StyledModal>
  </AppForm>
}

export type NoSignature<Info extends StateInfo> = Omit<Info, 'signature'>

export const SignatureBase = <Info extends StateInfo>(
  {enrichValues, children}: Props<NoSignature<Info>>
) => {
  const [signature, setSignature] = React.useState<string | null>()
  const [signatureType, setSignatureType] = React.useState<SignatureType>('upload')

  const enrichValuesWithSignature = (baseInfo: StatelessInfo): Info | null => {
    const values = enrichValues(baseInfo)
    if (!values) return null

    // Small hack to allow for registration status checks
    if (!signature && baseInfo.signature !== 'skip') {
      // Do not dismiss previous errors which may give more details on bad fields
      toast.error('Please fill out the signature field')
      return null
    }

    return {
      ...baseInfo,
      ...values,
      signature,
      signatureType,
    } as Info  // hack b/c it cannot understand how to distribute over types
  }

  return <Base<Info>
    enrichValues={enrichValuesWithSignature}
  >
    { children }
    <Signature setSignature={setSignature} setSignatureType={setSignatureType} signatureType={signatureType}/>
  </Base>
}
