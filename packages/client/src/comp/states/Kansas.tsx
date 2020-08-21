import React from 'react'
import { BaseInput } from '../util/Input'
import { KansasInfo, KansasIdentityType, kansasIdentityType } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { Upload } from '../util/Upload'
import { TogglableDropdown } from '../util/TogglableDropdown'

export const Kansas = () => {
  const [idPhoto, setIdPhoto] = React.useState<string>()
  const [option, setOption] = React.useState<KansasIdentityType>(kansasIdentityType[0])
  const [idNumber, setIdNumber] = React.useState<string>()

  const enrichValues = (baseInfo: StatelessInfo): NoSignature<KansasInfo> | null => {
    return {
      ...baseInfo,
      state: 'Kansas',
      idType: option,
      idPhoto,
      idNumber,
    }
  }

  return <SignatureBase<KansasInfo>enrichValues={enrichValues}>
    <TogglableDropdown<typeof kansasIdentityType>
      label='Identification Method:'
      style={{ marginTop: 40 }}
      options={kansasIdentityType}
      value={option}
      onChange={value => {
        setOption(value)

        // Clears unused inputs
        if (value === 'Copy of Photo ID') {
          setIdNumber(undefined)
        } else {
          setIdPhoto(undefined)
        }
      }}
    >{(option) => {
      switch (option) {
        case 'Copy of Photo ID': return <div>
          <p>If I do not have a current valid Kansas driver’s license number or Kansas nondriver’s identification card number, I must provide a copy of one of the following forms of photo identification with this application in order to receive a ballot.</p>
          <Upload label='Upload Photo of ID' setDataString={setIdPhoto} required={true}/>
        </div>

        default: return <BaseInput
          id='idData'
          label={option}
          required={true}
          value={idNumber}
          onChange={e => setIdNumber(e.currentTarget.value)}
        />
      }
    }}</TogglableDropdown>
  </SignatureBase>
}
