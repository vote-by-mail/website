import React from 'react'
import { BaseInput } from '../util/Input'
import { KansasInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { Upload } from '../util/Upload'
import { TogglableDropdown } from '../util/TogglableDropdown'

const options = {
  driversLicenseNumber: 'Driver\'s License Number',
  copyOfPhotoId: 'Copy of Photo ID',
} as const

export const Kansas = () => {
  const [idPhoto, setIdPhoto] = React.useState<string>()
  const [idType, setIdType] = React.useState<'Number' | 'Image'>('Number')
  const [idNumber, setIdNumber] = React.useState<string>()
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<KansasInfo> | null => {
    return {
      ...baseInfo,
      state: 'Kansas',
      idType,
      idPhoto,
      idNumber,
    }
  }

  // Clears unused inputs
  React.useEffect(() => {
    if (idType === 'Image') {
      setIdNumber(undefined)
    } else {
      setIdPhoto(undefined)
    }
  }, [idType, setIdNumber, setIdPhoto])

  return <SignatureBase<KansasInfo>enrichValues={enrichValues}>
    <TogglableDropdown
      defaultValue={options.driversLicenseNumber}
      label='Identification Method:'
      style={{ marginTop: 40 }}
      options={[
        options.driversLicenseNumber,
        options.copyOfPhotoId,
      ]}
      onChange={value => setIdType(
        value === options.driversLicenseNumber ? 'Number' : 'Image'
      )}
    >{
      (selected: string) => {
        if (selected === options.driversLicenseNumber) {
          return <BaseInput
            id='idData'
            label={selected}
            required={true}
            value={idNumber}
            onChange={e => setIdNumber(e.currentTarget.value)}
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
