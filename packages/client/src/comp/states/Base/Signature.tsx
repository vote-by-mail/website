import React from 'react'
import { StateInfo, SignatureType } from '../../../common'
import { StatelessInfo, Base, BaseProps } from '.'
import { toast } from 'react-toastify'
import { Signature } from '../../util/Signature'
import { ExperimentContainer } from '../../../lib/unstated'

export type NoSignature<Info extends StateInfo> = Omit<Info, 'signature'>

export const SignatureBase = <Info extends StateInfo>(
  {enrichValues, children}: BaseProps<NoSignature<Info>>
) => {
  const { experimentGroup } = ExperimentContainer.useContainer()
  const signatureTypeExperiment = experimentGroup('SignatureType')

  useEffect(() => {
    trackEvent('Experiment', 'Signature Type', signatureTypeExperiment)
  }, [signatureTypeExperiment])

  const [signature, setSignature] = React.useState<string | null>()
  const [signatureType, setSignatureType] = React.useState<SignatureType>(signatureTypeExperiment as SignatureType)

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
