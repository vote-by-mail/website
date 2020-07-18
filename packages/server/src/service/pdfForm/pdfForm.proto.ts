import fs from 'fs'
import { toSignatureBuffer } from './util'
import { stateInfo } from '../letter/router'
import { MassachusettsInfo } from '../../common'
import { fillMassachusetts } from './massachusetts'


const main = async () => {
  const data = await stateInfo('Massachusetts') as MassachusettsInfo
  const buffer = await fillMassachusetts({...data})
  fs.writeFileSync('/tmp/Foo.pdf', buffer)
  const signatureBuffer = await toSignatureBuffer(data.signature, 200, 50)
  fs.writeFileSync('/tmp/Bar.pdf', signatureBuffer)
}

main()
