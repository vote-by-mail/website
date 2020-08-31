import { KansasInfo, getStateAbbr, State } from '../../common'
import { fillFormWrapper  } from '.'
import { toSignatureBuffer } from './util'

export const fillKansas = (
  stateInfo: KansasInfo
) => fillFormWrapper(
  'Kansas.pdf',
  async ({text, placeImage}) => {
    const { addressParts } = stateInfo.address
    if (!addressParts) {
      throw(`Address.addressParts should've been defined by this point.`)
    }

    text(stateInfo.address.county || '', 0, 210, 119)
    text('Kansas', 0, 100, 132)
    text(stateInfo.address.county || '', 0, 240, 132)

    text(stateInfo.nameParts.last, 0, 60, 385)
    text(stateInfo.nameParts.first, 0, 240, 385)
    text(addressParts.street || '', 0, 60, 410)
    text(addressParts.city || '', 0, 300, 410)
    text(getStateAbbr(addressParts.state as State) ?? '', 0, 450, 410)
    text(addressParts.postcode || '', 0, 520, 410)
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
