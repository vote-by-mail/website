import React from 'react'

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
import { cssQuery } from '../util/cssQuery'
import { FieldsContainer } from './BaseContainer'
import { BaseRegistration, BaseRegistrationStatus } from './BaseRegistration'
import { BaseModal } from './BaseModal'

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
// We don't import AlloyResponse here since Base.tsx uses an extended RegistrationStatus
// whereas the one at common/voter.ts doesn't.
interface AlloyResponse {
  id?: string
  status: BaseRegistrationStatus
}

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

  const [ alloy, setAlloy ] = React.useState<AlloyResponse>({status: null})
  const [ ignoreRegistrationStatus, setIgnoreRegistrationStatus ] = React.useState<boolean>(false)
  const [ isOpen, setIsOpen ] = React.useState<boolean>(false)
  const [ modalContext, setModalContext ] = React.useState<'formSubmit'|'click'>('click')

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
      ...(alloy.id && alloy.status // Avoids type checking issues
        ? {alloy: { id: alloy.id, status: alloy.status as RegistrationStatus }}
        : {}),
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
    if (canCheckRegistration() && !ignoreRegistrationStatus) {
      const {
        firstName, lastName, birthdate,
      } = fields
      setAlloy({status: 'Loading'})

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
        setAlloy(result.data)
      } else {
        setAlloy({status: 'Error'})
      }
    }
  }

  // event is optional so we can use this function outside the form, i.e. modals
  async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
    if (event) {
      event.persist()  // allow async function call
      event.preventDefault()
    }

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
        onChange={e => updateField('firstName', e.currentTarget.value)}
        onBlur={e => checkRegistration('firstName', e)}
        required
      />
      <NameInput
        id='lastName'
        value={fields.lastName.value}
        label='Last Name'
        defaultValue={query.name}
        invalid={!fields.lastName}
        onChange={e => updateField('lastName', e.currentTarget.value)}
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
    <BaseRegistration
      registrationStatus={alloy.status}
      ignoreRegistrationStatus={ignoreRegistrationStatus}
      onClick={() => {
        setModalContext('click')
        setIsOpen(true)
      }}
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
      label='Mail my ballot to a different address than listed above'
    >{
      (checked) => <BaseInput
        id='mailing'
        value={fields.mailing.value}
        label='Mailing Address'
        required={checked}
        onChange={e => updateField('mailing', e.currentTarget.value)}
      />
    }</Togglable>
    { children }
    <Center>
      <RoundedButton
        color='primary'
        variant='raised'
        id='registrationSubmit'
        data-testid='submit'
        disabled={
          fetchingData
          || alloy.status === 'Loading' || alloy.status === null
          || !validInputs()
        }
        onClick={
          alloy.status !== 'Active' && !ignoreRegistrationStatus
            ? (e) => {
              e.preventDefault()
              setModalContext('formSubmit')
              setIsOpen(true)
            }
            : undefined
        }
      >
        Submit signup
      </RoundedButton>
    </Center>

    <BaseModal
      handleSubmit={handleSubmit}
      isOpen={isOpen}
      modalContext={modalContext}
      registrationStatus={alloy.status}
      setIgnoreRegistrationStatus={setIgnoreRegistrationStatus}
      setIsOpen={setIsOpen}
    />
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
