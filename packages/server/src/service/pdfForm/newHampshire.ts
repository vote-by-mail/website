import { NewHampshireInfo } from '../../common'
import { fillFormWrapper } from '.'
import { toSignatureBuffer, cleanPhoneNumber } from './util'

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
        check(0, 102, 570) // Democratic Party
      } else if (stateInfo.primaryParty === 'Republican Party') {
        check(0, 103, 554) // Republican Party
      }
    }
    check(0, 112, 478) // General Election

    text(stateInfo.nameParts.last, 1, 86, 58)
    text(stateInfo.nameParts.first, 1, 230, 58)
    if (stateInfo.nameParts.middle) {
      text(stateInfo.nameParts.middle, 1, 370, 58)
    }
    if (stateInfo.nameParts.suffix) {
      text(stateInfo.nameParts.suffix, 1, 500, 58)
    }
    text(stateInfo.uspsAddress, 1, 86, 127)
    // Sic: we want 'Same as above' even when stateInfo.mailingAddress === ''
    text(stateInfo.mailingAddress ? stateInfo.mailingAddress : 'Same as above', 1, 86, 196)

    const cleanNumber = cleanPhoneNumber(stateInfo.phone)
    text(cleanNumber.slice(0, 3), 1, 235, 237)
    text(cleanNumber.slice(3, 6), 1, 270, 237)
    text(cleanNumber.slice(6), 1, 320, 237)
    const emailSplit = stateInfo.email.split('@')
    text(emailSplit[0], 1, 230, 275)
    text(emailSplit[1], 1, 368, 275)

    text(new Date().toISOString().split('T')[0], 1, 435, 306)

    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 150, 30)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 1, 200, 313)
  }
)
