import fs from 'fs'
import { toSignatureBuffer } from './util'
import { sampleStateInfo } from '../letter'
import { VirginiaInfo } from '../../common'
import { fillVirginia } from './virginia'


const main = async () => {
  const data = await sampleStateInfo('Virginia') as VirginiaInfo
  const buffer = await fillVirginia({...data})
  fs.writeFileSync('/tmp/Foo.pdf', buffer)
  const signatureBuffer = await toSignatureBuffer(data.signature, 200, 50)
  fs.writeFileSync('/tmp/Bar.pdf', signatureBuffer)
}

main()
