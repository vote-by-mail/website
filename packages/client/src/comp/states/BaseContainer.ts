import React from 'react'

import { createContainer } from 'unstated-next'
import { NameParts } from '../../common'

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
  | 'mailing'

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
 * Unstated container containing the values of all inputs used in the registration
 * process.
 */
const useFields = () => {
  const [fields, _updateValid] = React.useState<Record<InputId, InputData>>({
    firstName: { valid: false, value: '' },
    lastName: { valid: false, value: '' },
    middleName: { valid: true, value: '' },
    suffix: { valid: true, value: '' },
    birthdate: { valid: false, value: '' },
    email: { valid: false, value: '' },
    telephone: { valid: true, value: '' },
    mailing: { valid: true, value: '' },
  })

   /**
   * Detects the content of all inputs needed for checking voter registration.
   * When possible, this function will contact the server, updating `registrationStatus`
   * when finished.
   */
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

  const nameParts = (): NameParts => ({
    first: fields.firstName.value,
    middle: fields.middleName.value ? fields.middleName.value : undefined,
    last: fields.lastName.value,
    suffix: fields.suffix.value ? fields.suffix.value : undefined,
  })

  return {
    fields,
    updateField,
    canCheckRegistration,
    validInputs,
    nameParts,
  }
}

export const FieldsContainer = createContainer(useFields)
