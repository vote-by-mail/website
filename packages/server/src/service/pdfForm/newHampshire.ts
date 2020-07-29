import { NewHampshireInfo } from '../../common'
import { fillFormWrapper } from '.'
import { toSignatureBuffer } from './util'

export const fillNewHampshire = (
  stateInfo: NewHampshireInfo
) => fillFormWrapper(
  'New_Hampshire.pdf',
  async ({check, text, placeImage}) => {
    check(0, 86, 110) // Qualified Voter
    check(0, 86, 295) // Covid
    if (stateInfo.primaryParty !== 'No Primary') {
      check(0, 112, 448) // Primary Election
      if (stateInfo.primaryParty === 'Democratic Party') {
        check(0, 103, 554) // Democratic Party
      } else if (stateInfo.primaryParty === 'Republican Party') {
        check(0, 102, 570) // Republican Party
      }
    }
    check(0, 112, 448) // General Election

    text(stateInfo.name, 1, 86, 58)
    text(stateInfo.uspsAddress, 1, 86, 127)
    // Sic: we want 'Same as above' even when stateInfo.mailingAddress === ''
    text(stateInfo.mailingAddress ? stateInfo.mailingAddress : 'Same as above', 1, 86, 196)

    text(stateInfo.phone, 1, 280, 237)
    const emailSplit = stateInfo.email.split('@')
    text(emailSplit[0], 1, 230, 275)
    text(emailSplit[1], 1, 368, 275)

    text(new Date().toISOString().split('T')[0], 1, 435, 306)

    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 150, 30)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 1, 200, 313)
  }
)
