import fs from 'fs'
import { toSignatureBuffer } from './util'
import { sampleStateInfo } from '../letter'
import { NewHampshireInfo } from '../../common'
import { fillNewHampshire } from './newHampshire'


const main = async () => {
  const data = await sampleStateInfo('New Hampshire') as NewHampshireInfo
  const buffer = await fillNewHampshire({...data})
  fs.writeFileSync('/tmp/Foo.pdf', buffer)
  const signatureBuffer = await toSignatureBuffer(data.signature, 200, 50)
  fs.writeFileSync('/tmp/Bar.pdf', signatureBuffer)
}

main()
