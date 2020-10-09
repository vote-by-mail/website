import { MinnesotaInfo, getStateAbbr, State, backwardCompatibleAddressParts } from '../../common'
import { fillFormWrapper  } from '.'
import { toSignatureBuffer, cleanPhoneNumber } from './util'

export const fillMinnesota = (
  stateInfo: MinnesotaInfo
) => fillFormWrapper(
  'Minnesota.pdf',
  async ({check, text, placeImage}) => {
    check(0, 410, 161) // General and primary elections
    const addressParts = backwardCompatibleAddressParts(stateInfo.address)

    text(stateInfo.nameParts.last, 0, 60, 225)
    text(stateInfo.nameParts.first, 0, 240, 225)
    if (stateInfo.nameParts.middle) {
      text(stateInfo.nameParts.middle, 0, 390, 225)
    }
    if (stateInfo.nameParts.suffix) {
      text(stateInfo.nameParts.suffix, 0, 535, 225)
    }

    text(stateInfo.birthdate, 0, 60, 265)

    // Get county data from contact.
    text(stateInfo.contact.county ? stateInfo.contact.county.split(' ')[0] : '', 0, 240, 263)

    const cleanNumber = cleanPhoneNumber(stateInfo.phone)
    text(cleanNumber.slice(0, 3), 0, 450, 262)
    text(cleanNumber.slice(3, 6), 0, 490, 262)
    text(cleanNumber.slice(6), 0, 527, 262)

    text(stateInfo.email, 0, 60, 295)

    if (stateInfo.idType == 'Minnesota Issued Driver\'s License or ID Card') {
      check(0, 64, 337)
      text(stateInfo.idData, 0, 400, 334)
    } else if (stateInfo.idType == 'Last 4 numbers of SSN') {
      check(0, 64, 354)
      text(stateInfo.idData, 0, 420, 354)
    } else {
      check(0, 64, 372)
    }

    text(addressParts.street, 0, 60, 422)
    text(addressParts.unit ? addressParts.unit : '', 0, 300, 422)
    text(addressParts.city ? addressParts.city : '', 0, 380, 422)
    text(addressParts.postcode ? addressParts.postcode : '', 0, 520, 422)

    // Sic: we want 'Same as above' even when stateInfo.mailingAddress === ''
    if(!stateInfo.mailingAddressParts && !stateInfo.mailingAddress) {
      text('Same as above', 0, 60, 462)
    } else {
      if (stateInfo.mailingAddressParts) {
        const { city, postcode, state, street, unit } = stateInfo.mailingAddressParts
        const stateAbbr = getStateAbbr(state as State)

        text(street, 0, 60, 462)
        text(unit ?? '', 0, 300, 462)
        text(city ?? '', 0, 380, 462)
        text(stateAbbr ?? state, 0, 460, 462)
        text(postcode ?? '', 0, 520, 462)
      } else {
        text(stateInfo.mailingAddress ?? '', 0, 60, 462)
      }
    }

    const dateSplit = new Date().toISOString().split('T')[0].split('-')

    text(dateSplit[1], 0, 478, 624, 16)
    text(dateSplit[2], 0, 515, 624, 16)
    text(dateSplit[0], 0, 549, 624, 16)

    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 120, 30)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 140, 632)
  }
)
