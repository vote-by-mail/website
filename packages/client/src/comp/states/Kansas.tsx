import React from 'react'
import { BaseInput } from '../util/Input'
import { KansasInfo } from '../../common'
import { SignatureBase, StatelessInfo, NoSignature } from './Base'
import { Upload } from '../util/Upload'
import { TogglableDropdown } from '../util/TogglableDropdown'

const options = [
  'Driver\'s License Number',
  'Copy of Photo ID',
] as const

export const Kansas = () => {
  const [idPhoto, setIdPhoto] = React.useState<string>()
  const [idType, setIdType] = React.useState<'Number' | 'Image'>('Number')
  const [idNumber, setIdNumber] = React.useState<string>()
  const [option, setOption] = React.useState<typeof options[number]>('Driver\'s License Number')
  const enrichValues = (baseInfo: StatelessInfo): NoSignature<KansasInfo> | null => {
    return {
      ...baseInfo,
      state: 'Kansas',
      idType,
      idPhoto,
      idNumber,
    }
  }

  return <SignatureBase<KansasInfo>enrichValues={enrichValues}>
    <TogglableDropdown<typeof options>
      defaultValue={option}
      label='Identification Method:'
      style={{ marginTop: 40 }}
      options={options}
      value={option}
      onChange={value => {
        setOption(value)
        setIdType(value === 'Driver\'s License Number' ? 'Number' : 'Image')

        // Clears unused inputs
        if (idType === 'Image') {
          setIdNumber(undefined)
        } else {
          setIdPhoto(undefined)
        }
      }}
    >{(selected) => {
      switch (selected) {
        case 'Copy of Photo ID': return <div>
          <p>If I do not have a current valid Kansas driver’s license number or Kansas nondriver’s identification card number, I must provide a copy of one of the following forms of photo identification with this application in order to receive a ballot.</p>
          <Upload label='Upload Photo of ID' setDataString={setIdPhoto} required={true}/>
        </div>

        default: return <BaseInput
          id='idData'
          label={selected}
          required={true}
          value={idNumber}
          onChange={e => setIdNumber(e.currentTarget.value)}
        />
      }
    }}</TogglableDropdown>
  </SignatureBase>
}
