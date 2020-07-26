import React from 'react'
// import Input from 'muicss/lib/react/input'

import { BaseInfo, StateInfo, isImplementedLocale, SignatureType } from '../../common'
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
import { FieldsContainer } from './BaseContainer'
import { BaseRegistration, BaseRegistrationStatus } from './BaseRegistration'

export type StatelessInfo = Omit<BaseInfo, 'state'>

type EnrichValues<Info> = (base: StatelessInfo) => Info | null

type Props<Info> = React.PropsWithChildren<{
  enrichValues: EnrichValues<Info>
}>

const NameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  .mui-textfield { flex: 1; }
  ${cssQuery.medium} {
    flex-direction: row;
    .mui-textfield:nth-child(1) { margin-right: 15px; }
  }
`

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
  const {
    fields,
    updateField,
    canCheckRegistration,
    validInputs,
  } = FieldsContainer.useContainer()
  const [ registrationStatus, setRegistrationStatus ] = React.useState<BaseRegistrationStatus>(null)
  const [ isOpen, setIsOpen ] = React.useState<boolean | 'fromSubmit'>(false)

  if (!locale || !isImplementedLocale(locale) || !contact) return null

  const uspsAddress = address ? address.fullAddr : null
  const { city, county, otherCities, latLong } = locale

  const stateInfo = (): StateInfo | null => {
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

    const info = enrichValues(base)

    if (!info) {
      // Do not dismiss previous errors which may give more details on bad fields
      toast.error('Please fill all the required fields in the right formats')
    }

    return info
  }

  async function checkRegistration(
    id: 'firstName' | 'lastName' | 'birthdate',
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    e.preventDefault()
    e.persist() // allow async function call
    updateField(id, e.currentTarget.value)
    if (canCheckRegistration()) {
      if (registrationStatus !== 'Ignored' && registrationStatus !== 'Active') {
        const {
          firstName, lastName, birthdate,
        } = fields
        setRegistrationStatus('Loading')

        const result = await client.isRegistered({
          firstName: firstName.value,
          lastName: lastName.value,
          birthdate: birthdate.value,
          city: address?.city ?? '',
          postcode: address?.postcode ?? '',
          stateAbbr: address?.stateAbbr ?? '',
          street: address?.street ?? '',
          streetNumber: address?.streetNumber ?? '',
        })
        if (result.type === 'data') {
          setRegistrationStatus(result.data ?? 'Error')
        } else {
          setRegistrationStatus('Error')
        }
      }
    }
  }

  // event is optional so we can use this function outside the form, i.e. modals
  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    event?.persist()  // allow async function call
    event?.preventDefault()

    const info = stateInfo()
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
        value={fields.firstName.value}
        label='First Name'
        defaultValue={query.name}
        invalid={!fields.firstName}
        onChange={e => {
          // Reset registration status on name change
          setRegistrationStatus(null)
          updateField('firstName', e.currentTarget.value)
        }}
        onBlur={e => checkRegistration('firstName', e)}
        required
      />
      <NameInput
        id='lastName'
        value={fields.lastName.value}
        label='Last Name'
        defaultValue={query.name}
        invalid={!fields.lastName}
        onChange={e => {
          // Reset registration status on name change
          setRegistrationStatus(null)
          updateField('lastName', e.currentTarget.value)
        }}
        onBlur={e => checkRegistration('lastName', e)}
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
      value={fields.birthdate.value}
      defaultValue={query.birthdate}
      invalid={!fields.birthdate}
      // Makes the input red when invalid, for some reason just setting
      // invalid to true is not enough
      pattern='^(0[1-9]|1[012])[/.](0[1-9]|[12][0-9]|3[01])[/.](19|20)[0-9]{2}$'
      onChange={e => {
        const { value } = e.currentTarget
        // Removes non-numbers and replaces '-' with '/'
        const normalizedValue = value.replace(
          '-',
          '/',
        ).replace(
          /[^(0-9)|(/).]/g,
          '',
        )
        updateField('birthdate', normalizedValue)
      }}
      onBlur={e => checkRegistration('birthdate', e)}
      required
    />
    <EmailInput
      id='email'
      value={fields.email.value}
      defaultValue={query.email}
      invalid={!fields.email}
      onChange={e => updateField('email', e.currentTarget.value)}
      required
    />
    <PhoneInput
      id='telephone'
      value={fields.telephone.value}
      defaultValue={query.telephone}
      invalid={!fields.telephone}
      onChange={e => updateField('telephone', e.currentTarget.value)}
    />
    <Togglable
      id='mailing'
      label='Mail my ballot to a different address than listed above'
    >{
      (checked) => <BaseInput
        id='mailing'
        value={fields.mailing.value}
        label='Mailing Address'
        required={checked}
      />
    }</Togglable>
    { children }
    <BaseRegistration registrationStatus={registrationStatus} setIsOpen={setIsOpen}/>
    <Center>
      <RoundedButton
        color='primary'
        variant='raised'
        id='registrationSubmit'
        data-testid='submit'
        disabled={
          fetchingData
          || registrationStatus === 'Loading' || registrationStatus === null
          || !validInputs()
        }
        onClick={
          registrationStatus !== 'Active' && registrationStatus !== 'Ignored'
            ? (e) => {
              e.preventDefault()
              setIsOpen('fromSubmit')
            }
            : undefined
        }
      >
        Submit signup
      </RoundedButton>
    </Center>

    <StyledModal
      isOpen={isOpen !== false}
      data-testid='registrationStatusModal'
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
        onClick={() => {
          setRegistrationStatus('Ignored')
          if (isOpen === 'fromSubmit') {
            handleSubmit()
          }
          setIsOpen(false)
        }}
      >
        Ignore Warning
      </RoundedButton>
      <RoundedButton color='primary' onClick={() => setIsOpen(false)}>
        Recheck Fields
      </RoundedButton>
    </StyledModal>
  </AppForm>
}

export const Base = <Info extends StateInfo>({ enrichValues, children }: Props<Info>) => {
  return <FieldsContainer.Provider>
    <ContainerlessBase enrichValues={enrichValues}>
      {children}
    </ContainerlessBase>
  </FieldsContainer.Provider>
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

    if (!signature) {
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
