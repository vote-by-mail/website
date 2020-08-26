import { KansasInfo } from '../../common'
import { fillFormWrapper  } from '.'
import { toSignatureBuffer } from './util'

export const fillKansas = (
  stateInfo: KansasInfo
) => fillFormWrapper(
  'Kansas.pdf',
  async ({text, placeImage}) => {

    text(stateInfo.address.county || '', 0, 210, 119)
    text('Kansas', 0, 100, 132)
    text(stateInfo.address.county || '', 0, 240, 132)
    
    text(stateInfo.name, 0, 60, 385)
    const streetAddress = ((stateInfo.address.streetNumber || '') + ' ' + (stateInfo.address.street || ''))
    text(streetAddress || '', 0, 60, 410)
    text(stateInfo.address.city || '', 0, 300, 410)
    text('KS', 0, 450, 410)
    text(stateInfo.address.postcode || '', 0, 520, 410)
    text(stateInfo.birthdate, 0, 450, 385)
    text(stateInfo.phone, 0, 450, 672)
    if(!stateInfo.mailingAddress) {
      text('Same as above', 0, 60, 485)
    } else {
      text(stateInfo.mailingAddress, 0, 60, 485)
    }

    if (stateInfo.idNumber) {
      text(stateInfo.idNumber, 0, 415, 225)
    } else {
      text("See attached photo ID", 0, 415, 225)
    }

    text('2020-11-03', 0, 50, 630)  // Promising not to vote in person on general election day

    text(new Date().toISOString().split('T')[0], 0, 320, 672)
    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 200, 40)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 110, 680)
  }
)