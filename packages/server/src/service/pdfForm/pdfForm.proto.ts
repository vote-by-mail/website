import fs from 'fs'
import { toSignatureBuffer } from './util'
import { sampleStateInfo, pdfForm } from '../letter'


const main = async () => {
  const info = await sampleStateInfo('North Dakota')
  const buffer = await pdfForm(info)
  fs.writeFileSync('/tmp/Foo.pdf', buffer)
  const signatureBuffer = await toSignatureBuffer(info.signature, 200, 50)
  fs.writeFileSync('/tmp/Bar.pdf', signatureBuffer)
}

main()
