import React from 'react'

import { SmallButton } from './Button'
import { SignatureType } from '../../common'


interface Props {
  children: (usedCanvas: SignatureType) => React.ReactNode
  visibleSwitchButton: boolean
  signatureType: SignatureType
  setSignatureType: (_: SignatureType) => void
}

export const Switchable: React.FC<Props> = ({children, visibleSwitchButton, signatureType, setSignatureType}) => {
  return <>
    <div style={{display: visibleSwitchButton ? 'flex' : 'none' , justifyContent: 'center'}}>
      <SmallButton
        style={{marginRight: '0', borderRadius: '4px 0 0 4px'}}
        color='primary'
        disabled={signatureType === 'upload'}
        onClick={() => setSignatureType('upload')}
      >
        Upload
      </SmallButton>
      <SmallButton
        style={{marginLeft: '0', borderRadius: '0 4px 4px 0'}}
        color='primary'
        disabled={signatureType === 'canvas'}
        onClick={() => setSignatureType('canvas')}
      >
        Pad
      </SmallButton>
    </div>
    {(children) && children(signatureType)}
  </>
}
