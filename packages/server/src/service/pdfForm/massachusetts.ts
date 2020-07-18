import { MassachusettsInfo } from '../../common'
import { fillFormWrapper  } from '.'
import { toSignatureBuffer } from './util'

export const fillMassachusetts = (
  stateInfo: MassachusettsInfo
) => fillFormWrapper(
  __dirname + '/forms/Massachusetts.pdf',
  async ({check, text, placeImage}) => {
    
    text(stateInfo.name, 0, 200, 103)
    text(stateInfo.address.fullAddr, 0, 165, 150)
    text(stateInfo.birthdate, 0, 245, 197)
    text(stateInfo.phone, 0, 445, 197)
    text(stateInfo.email, 0, 250, 220)
    if(!stateInfo.mailingAddress) {
      text(stateInfo.address.fullAddr, 0, 250, 255)
    } else {
      text(stateInfo.mailingAddress, 0, 250, 255)
    }

    if(stateInfo.partyData) {
      text(stateInfo.partyData, 0, 300, 405)
    }

    check(0, 190, 320) // All elections this year
    text(new Date().toISOString().split('T')[0], 0, 480, 745, 16)
    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 200, 40)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 205, 760)
  }
)