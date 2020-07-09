import React from 'react'
import Input from 'muicss/lib/react/input'

import { BaseInfo, StateInfo, isImplementedLocale, SignatureType } from '../../common'
import { client } from '../../lib/trpc'
import { RoundedButton } from '../util/Button'
import { useControlRef } from '../util/ControlRef'
import { BaseInput, PhoneInput, EmailInput, NameInput, BirthdateInput } from '../util/Input'
import { Togglable } from '../util/Togglable'
import { AppCheckbox } from '../util/Checkbox'
import { useAppHistory } from '../../lib/path'
import { Signature } from '../util/Signature'
import { AddressContainer, VoterContainer, ContactContainer, FetchingDataContainer } from '../../lib/unstated'
import { ContactInfo } from '../contact/ContactInfo'
import { AppForm } from '../util/Form'
import { Center } from '../util/Util'
import { toast } from 'react-toastify'

export type StatelessInfo = Omit<BaseInfo, 'state'>

type EnrichValues<Info> = (base: StatelessInfo) => Info | null

type Props<Info> = React.PropsWithChildren<{
  enrichValues: EnrichValues<Info>
}>

const privacyPolicyUrl = process.env.REACT_APP_URL + '/PrivacyPolicy.pdf'

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

  const nameRef = useControlRef<Input>()
  const birthdateRef = useControlRef<Input>()
  const emailRef = useControlRef<Input>()
  const phoneRef = useControlRef<Input>()
  const mailingRef = useControlRef<Input>()
  if (!locale || !isImplementedLocale(locale) || !contact) return null

  const uspsAddress = address ? address.fullAddr : null
  const { city, county, otherCities, latLong } = locale

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.persist()  // allow async function call
    event.preventDefault()

    if (!address || !uspsAddress || !contact) {
      toast.error('Please fill all the required fields')
      return
    }

    const baseInfo: StatelessInfo = {
      city: contact.city ?? city,
      county: contact.county ?? county,
      otherCities,
      latLong,
      oid,
      name: nameRef.value() || '',
      birthdate: birthdateRef.value() || '',
      email: emailRef.value() || '',
      mailingAddress: mailingRef.value() || '',
      phone: phoneRef.value() || '',
      uspsAddress,
      contact,
      address,
    }

    const info = enrichValues(baseInfo)
    if (!info) {
      // Do not dismiss previous errors which may give more details on bad fields
      toast.error('Please fill all the required fields in the right formats')
      return
    }
    setFetchingData(true)
    const result = await client.register(info, voter)
    setFetchingData(false)
    if(result.type === 'data'){
      pushSuccess(result.data)
    } else {
      toast.error('Error signing up.  Try resubmitting.  If this persists, try again in a little while.')
    }
  }

  return <AppForm onSubmit={handleSubmit}>
    <NameInput
      id='name'
      ref={nameRef}
      defaultValue={query.name}
      required
    />
    <BaseInput
      id='registrationAddress'
      label='Registration Address'
      defaultValue={address?.queryAddr}
      disabled
    />
    <ContactInfo locale={locale} contact={contact}/>
    <BirthdateInput
      id='birthdate'
      ref={birthdateRef}
      defaultValue={query.birthdate}
      required
    />
    <EmailInput
      id='email'
      ref={emailRef}
      defaultValue={query.email}
      required
    />
    <PhoneInput
      id='telephone'
      ref={phoneRef}
      defaultValue={query.telephone}
    />
    <Togglable
      id='mailing'
      label='Mail my ballot to a separate mailing address'
    >{
      (checked) => <BaseInput
        id='mailing'
        label='Mailing Address'
        ref={mailingRef}
        required={checked}
      />
    }</Togglable>
    { children }
    <AppCheckbox label={
      <span>
        I have&nbsp;
          <a target="_blank" rel="noopener noreferrer" href='https://www.vote.org/am-i-registered-to-vote/'>
            confirmed that I am registered&nbsp;
          </a> 
          to vote at this address and have read VoteByMail&apos;s&nbsp;
          <a target="_blank" rel="noopener noreferrer" href={privacyPolicyUrl}>
            privacy policy
          </a>
      </span>
    } required={true}/>
    <Center>
      <RoundedButton color='primary' variant='raised' data-testid='submit' disabled={fetchingData}>
        Submit signup
      </RoundedButton>
    </Center>
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
