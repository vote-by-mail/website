import React from 'react'

import { MichiganInfo } from '../../common'
import { SignatureBase } from './Base'
import { useCheckboxRef } from '../util/ControlRef'
import { AppCheckbox } from '../util/Checkbox'


export const Michigan = () => {
  const ref = useCheckboxRef()

  return <SignatureBase<MichiganInfo>
    enrichValues={(info) => {
      const permanentList = ref.value()
      if (permanentList == null) return null
      return {...info, state: 'Michigan', permanentList}
    }}
  >
    <AppCheckbox
      ref={ref}
      label={'Request Michigan mail an application for vote by mail to me prior to future elections.'}
      defaultChecked={true}
    />
  </SignatureBase>
}
