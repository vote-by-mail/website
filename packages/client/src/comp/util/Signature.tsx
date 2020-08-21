import React from 'react'
import styled from 'styled-components'

import { Switchable } from './Switchable'
import { Upload } from './Upload'
import { Canvas } from './Canvas'
import { useAppHistory } from '../../lib/path'
import { SignatureType, eligibleSignatureType, isImplementedLocale } from '../../common'
import { AddressContainer } from '../../lib/unstated'


const width = 300
const height = width / 1.618

const Margin = styled.div`
  padding-top: 15px;
  margin-bottom: 20px;
`

type Props = React.PropsWithChildren<{
  setSignature: (_: string | null) => void
  signatureType: SignatureType
  setSignatureType: (_: SignatureType) => void
}>

export const Signature: React.FC<Props> = ({ setSignature, setSignatureType, signatureType }) => {
  const { query } = useAppHistory()
  const { locale } = AddressContainer.useContainer()

  // Unlikely to happen, here for type-checking
  if (!locale) {
    throw Error(`Locale (${locale}) is falsy`)
  } else if (!isImplementedLocale(locale)) {
    throw Error(`Locale state (${locale.state}) is not implemented`)
  }
  const stateSignatureType = eligibleSignatureType(locale.state)

  // Ensures signatureType is the same as the one from stateSignatureType
  if (stateSignatureType !== 'both') {
    setSignatureType(stateSignatureType)
  }

  return <Margin>
    <Switchable
      visibleSwitchButton={query['case'] !== 'upload' && stateSignatureType === 'both'} signatureType={signatureType}
      setSignatureType={setSignatureType}
    >{
      (signatureType) => {
        if (signatureType === 'canvas') {
          return <div>
            <div>
              <Canvas setSignature={setSignature} width={width} height={height}/>
            </div>
          </div>
        } else {
          return <div>
            <div>
              <Upload label='Upload Signature' icon='fa-signature' setDataString={setSignature} />
            </div>
          </div>
        }
      }
    }</Switchable>
  </Margin>
}
