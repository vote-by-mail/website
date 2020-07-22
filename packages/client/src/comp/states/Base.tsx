import React from 'react'
// import Input from 'muicss/lib/react/input'
import { createContainer } from 'unstated-next'

import { BaseInfo, StateInfo, isImplementedLocale, SignatureType, RegistrationStatus } from '../../common'
import { client } from '../../lib/trpc'
import { RoundedButton } from '../util/Button'
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
import { cssQuery } from '../util/cssQuery'

export type StatelessInfo = Omit<BaseInfo, 'state'>

type EnrichValues<Info> = (base: StatelessInfo) => Info | null

type Props<Info> = React.PropsWithChildren<{
  enrichValues: EnrichValues<Info>
}>

const datePattern = /^(0[1-9]|1[012])[/.](0[1-9]|[12][0-9]|3[01])[/.](19|20)[0-9]{2}$/i
// eslint-disable-next-line no-useless-escape
const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const telephonePattern = /[0-9]{3}-?[0-9]{3}-?[0-9]{4}/

const NameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .mui-textfield { flex: 1; }
  ${cssQuery.medium} {
    flex-direction: row;
    .mui-textfield:nth-child(1) { margin-right: 15px; }
  }
`

const hasSpace = (s: string | null) => {
  return (s?.indexOf(' ') ?? -1) !== -1
}

type ExtendedStatus = RegistrationStatus | 'Error' | 'Ignored' | 'Not Found'

type InputId =
  | 'birthdate'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'telephone'
  | 'mailing'

interface InputData {
  valid: boolean
  value: string
}

// Unstated container containing the values of all inputs used in the registration
// process.
const useForm = () => {
  const [fields, updateFields] = React.useState<Record<InputId, InputData>>({
    firstName: {valid: false, value: ''},
    lastName: {valid: false, value: ''},
    birthdate: {valid: false, value: ''},
    email: {valid: false, value: ''},
    telephone: {valid: true, value: ''},
    mailing: {valid: true, value: ''},
  })

   /**
   * Detects the content of all inputs needed for checking voter registration.
   * When possible, this function will contact the server, updating `registrationStatus`
   * when finished.
   *
   * @param onBlur Helps us perform more intensive checks only when the input
   * lose focus.
   */
  const updateField = (id: InputId, e: React.ChangeEvent<HTMLInputElement>, onBlur: boolean) => {
    e.preventDefault()
    let { value } = e.currentTarget
    let valid = true
    switch (id) {
      case 'birthdate':
        // Removes non-numbers and replaces '-' with '/'
        value = e.currentTarget.value.replace(
          '-',
          '/',
        )
        value = e.currentTarget.value.replace(
          /[^(0-9)|(/).]/g,
          '',
        )

        valid = datePattern.test(value)
        if (onBlur && !valid && value) {
          toast.warning('Please type a valid date.')
        }
        break

      case 'firstName':
      case 'lastName': {
        const isFirstName = id === 'firstName'
        // Check if the user has typed more than one name in a single field
        // or if the value is empty
        valid = !hasSpace(value) && value !== ''

        if (!valid && onBlur && value) {
          toast.warning(
            `Please type only your ${isFirstName ? 'first' : 'last'} name and with no spaces.`
          )
        }
      } break

      case 'email':
        valid = emailPattern.test(value)
        if (onBlur && !valid && value) {
          toast.warning('Please make sure to enter a valid email')
        }
        break

      case 'telephone':
        if (value) {
          valid = telephonePattern.test(value)
          if (onBlur && !valid) {
            toast.warning('Please make sure to enter a valid phone number')
          }
        } else {
          valid = true
        }
        break
    }

    updateFields({ ...fields, [id]: { valid, value } })
  }

  return {
    fields,
    updateField
  }
}

const FormContainer = createContainer(useForm)

/**
 * this works with redirect urls of the form
 * /#/org/default/state?registrationAddress=100%20S%20Biscayne%20Blvd,%20Miami,%20FL%2033131&name=George%20Washington&birthdate=1945-01-01&email=george@us.gov&telephone=212-111-1111
 */
const ContainerlessBase = <Info extends StateInfo>({ enrichValues, children }: Props<Info>) => {
  const { pushSuccess, oid, query } = useAppHistory()
  const { address, locale } = AddressContainer.useContainer()
  const { contact } = ContactContainer.useContainer()
  const { voter } = VoterContainer.useContainer()
  const { fetchingData, setFetchingData } = FetchingDataContainer.useContainer()
  const { fields, updateField } = FormContainer.useContainer()
  const [ registrationStatus, setRegistrationStatus ] = React.useState<ExtendedStatus>(null)

  if (!locale || !isImplementedLocale(locale) || !contact) return null
  const canCheckRegistration = () => (
    fields.birthdate.valid && fields.firstName.valid && fields.lastName.valid
  )
  const validInputs = () => (
    canCheckRegistration() && fields.email.valid && fields.telephone.valid
  )

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
      name: `${fields.firstName.value} ${fields.lastName.value}`,
      birthdate: fields.birthdate.value,
      email: fields.email.value,
      mailingAddress: fields.mailing.value,
      phone: fields.telephone.value,
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

  async function aboutRegistrationBlur(
    id: 'firstName' | 'lastName' | 'birthdate',
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    e.preventDefault()
    e.persist() // allow async function call
    updateField(id, e, true)
    if (canCheckRegistration()) {
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
        defaultValue={query.name}
        onChange={e => {
          // Reset registration status on name change
          setRegistrationStatus(null)
          updateField('firstName', e, false)
        }}
        onBlur={e => aboutRegistrationBlur('firstName', e)}
        required
      />
      <NameInput
        id='lastName'
        label='Last Name'
        defaultValue={query.name}
        onChange={e => {
          // Reset registration status on name change
          setRegistrationStatus(null)
          updateField('lastName', e, false)
        }}
        onBlur={e => aboutRegistrationBlur('lastName', e)}
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
      defaultValue={query.birthdate}
      onChange={e => updateField('birthdate', e, false)}
      onBlur={e => aboutRegistrationBlur('birthdate', e)}
      required
    />
    <EmailInput
      id='email'
      defaultValue={query.email}
      onChange={e => updateField('email', e, false)}
      onBlur={e => updateField('email', e, true)}
      required
    />
    <PhoneInput
      id='telephone'
      defaultValue={query.telephone}
      onChange={e => updateField('telephone', e, false)}
      onBlur={e => updateField('telephone', e, true)}
    />
    <Togglable
      id='mailing'
      label='Mail my ballot to a different address than listed above'
    >{
      (checked) => <BaseInput
        id='mailing'
        label='Mailing Address'
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

export const Base = <Info extends StateInfo>({ enrichValues, children }: Props<Info>) => {
  return <FormContainer.Provider>
    <ContainerlessBase enrichValues={enrichValues}>
      {children}
    </ContainerlessBase>
  </FormContainer.Provider>
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
