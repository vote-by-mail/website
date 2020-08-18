import React from 'react'

import Select from 'muicss/lib/react/select'
import { BaseInput } from '../util/Input'

import { KansasInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { Upload } from '../util/Upload'
import { useControlRef } from '../util/ControlRef'
import { TogglableDropdown } from '../util/TogglableDropdown'

const options = {
  driversLicenseNumber: 'Driver\'s License Number',
  copyOfPhotoId: 'Copy of Photo ID',
} as const

export const Kansas = () => {
  const idNumberRef = useControlRef<Select>()
  const [idPhoto, setIdPhoto] = React.useState<string>()
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<KansasInfo> | null => {
    const idNumber = idNumberRef.value() || undefined
    const idType = idNumberRef.value() != null ? 'Number' : 'Image'
    return {
      ...baseInfo,
      state: 'Kansas',
      idType,
      idPhoto,
      idNumber,
    }
  }

  return <SignatureBase<KansasInfo>enrichValues={enrichValues}>
    <TogglableDropdown
      defaultValue={options.driversLicenseNumber}
      label='Identification Method:'
      style={{ marginTop: 40 }}
      options={[
        options.driversLicenseNumber,
        options.copyOfPhotoId,
      ]}
    >{
      (selected: string) => {
        if (selected === options.driversLicenseNumber) {
          return <BaseInput
            id='idData'
            label={selected}
            required={true}
            ref={idNumberRef}
          />
        } 
        return (
          <div>
            <p>If I do not have a current valid Kansas driver’s license number or Kansas nondriver’s identification card number, I must provide a copy of one of the following forms of photo identification with this application in order to receive a ballot.</p>
            <Upload label='Upload Photo of ID' setDataString={setIdPhoto} required={true}/>
          </div>
        )
      }
    }</TogglableDropdown>
  </SignatureBase>
}
