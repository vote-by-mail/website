import React from 'react'

import { createContainer } from 'unstated-next'
import { NameParts, AddressInputParts } from '../../common'
import { useAppHistory } from '../../lib/path'
import { AddressInputPartContainer } from '../Address'

const datePattern = /(0[1-9]|1[012])[/.](0[1-9]|[12][0-9]|3[01])[/.](19|20)[0-9]{2}/i
// eslint-disable-next-line no-useless-escape
const emailPattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const telephonePattern = /[0-9]{3}-?[0-9]{3}-?[0-9]{4}/

type InputId =
  | 'birthdate'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'suffix'
  | 'telephone'

const isInputValid = (id: InputId, value: string): boolean => {
  switch (id) {
    case 'birthdate': return datePattern.test(value)
    case 'firstName':
    case 'lastName': {
      // Check if the user has typed a valid name: without numbers & non-empty
      return value !== '' && /^([^0-9]*)$/.test(value)
    }
    case 'middleName':
    case 'suffix': {
      // Middle name and Suffix can be empty
      if (value === '') {
        return true
      }
      // Check if the user has typed a valid name: without numbers & non-empty
      return /^([^0-9]*)$/.test(value)
    }
    case 'email': return emailPattern.test(value)
    case 'telephone': {
      return value ? telephonePattern.test(value) : true
    }
    default: return true
  }
}

interface InputData {
  valid: boolean
  value: string
}

/**
 * Handles the default value of fields, returning a InputData
 *
 * @param id the InputId of the field
 * @param queryValue The query value from AppHistory
 * @param defaultValid The default valid state for this field when empty,
 * for example optional fields have this value set to true
 */
const defaultInputData = (
  id: InputId,
  queryValue: string | undefined,
  defaultValid: boolean,
): InputData => {
  if (queryValue) {
    return {
      valid: isInputValid(id, queryValue),
      value: queryValue,
    }
  }

  return {
    valid: defaultValid,
    value: '',
  }
}

/**
 * Unstated container containing the values of all inputs used in the registration
 * process.
 */
const useFields = () => {
  const { query } = useAppHistory()
  const { fields: addressFields } = AddressInputPartContainer.useContainer()

  const [fields, _updateValid] = React.useState<Record<InputId, InputData>>({
    firstName: defaultInputData('firstName', query.firstName, false),
    middleName: defaultInputData('middleName', query.middleName, true),
    lastName: defaultInputData('lastName', query.lastName, false),
    suffix: defaultInputData('suffix', query.suffix, true),
    birthdate: defaultInputData('birthdate', query.birthdate, false),
    email: defaultInputData('email', query.email, false),
    telephone: defaultInputData('telephone', query.telephone, true),
  })

  const nameParts: NameParts = {
    first: fields.firstName.value,
    middle: fields.middleName.value ? fields.middleName.value : undefined,
    last: fields.lastName.value,
    suffix: fields.suffix.value ? fields.suffix.value : undefined,
  }

  const updateField = (id: InputId, value: string) => {
    _updateValid({ ...fields, [id]: { valid: isInputValid(id, value), value } })
  }

  const canCheckRegistration = () => (
    fields.birthdate.valid && fields.firstName.valid && fields.lastName.valid &&
    fields.middleName.valid && fields.suffix.valid
  )
  const validInputs = () => (
    canCheckRegistration() && fields.email.valid && fields.telephone.valid
  )

  const [ _mailingFields, _setMailingField ] = React.useState<AddressInputParts>({
    city: '',
    postcode: '',
    // This is most likely to be the same as the main address state, set
    // this as the default address.
    state: addressFields.state,
    street: '',
    unit: '',
  })

  const setMailingField = (id: keyof AddressInputParts, value: string) => {
    _setMailingField({ ..._mailingFields, [id]: value })
  }
  // Removes optional empty values
  const mailingFields: AddressInputParts = {
    city: _mailingFields.city,
    postcode: _mailingFields.postcode,
    state: _mailingFields.state,
    street: _mailingFields.street,
    unit: _mailingFields.unit ? _mailingFields.unit : undefined,
  }

  return {
    fields,
    updateField,
    canCheckRegistration,
    validInputs,
    nameParts,
    mailingFields,
    setMailingField,
  }
}

export const FieldsContainer = createContainer(useFields)
