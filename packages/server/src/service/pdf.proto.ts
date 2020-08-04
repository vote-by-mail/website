import { toPdfBuffer } from './pdf'
import fs from 'fs'
import { Letter, sampleStateInfo } from './letter'
import { getFirstContact } from './contact'
import { toContactMethod } from '../common'

const main = async () => {
  const state = 'Kansas'
  const info = await sampleStateInfo(state)
  const contact = await getFirstContact(state)
  const method = toContactMethod({...contact, state})
  const letter = new Letter({
      ...info,
    },
    method,
    'sampleConfirmationId'
  )

  const pdfBuffer = await toPdfBuffer(letter.render('html'))

  fs.writeFileSync('/tmp/test.pdf', pdfBuffer)
  console.log(letter.md('html'))
}

main()
