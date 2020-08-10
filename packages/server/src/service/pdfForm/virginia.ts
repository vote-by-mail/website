import { VirginiaInfo } from '../../common'
import { fillFormWrapper  } from '.'
import { cleanPhoneNumber, toSignatureBuffer } from './util'

export const fillVirginia = (
  stateInfo: VirginiaInfo
) => fillFormWrapper(
  'Virginia.pdf',
  async ({check, text, placeImage}) => {

    const { nameParts } = stateInfo

    // First name.
    text(nameParts.first, 0, 410, 60)
    // Middle initial.
    if (nameParts.middle) {
      text(nameParts.middle, 0, 190, 77)
    }
    // Last name.
    text(nameParts.last, 0, 180, 60)
    // Suffix.
    if (nameParts.suffix) {
      text(nameParts.suffix, 0, 410, 77)
    }

    // Birth year.
    const birthYear = stateInfo.birthdate.split('/')[2]
    text(birthYear[0], 0, 208, 94)
    text(birthYear[1], 0, 228, 94)
    text(birthYear[2], 0, 247, 94)
    text(birthYear[3], 0, 266, 94)

    // Last 4 SSN digits.
    text(stateInfo.last4DigitsOfSsn[0], 0, 528, 94)
    text(stateInfo.last4DigitsOfSsn[1], 0, 546, 94)
    text(stateInfo.last4DigitsOfSsn[2], 0, 562, 94)
    text(stateInfo.last4DigitsOfSsn[3], 0, 578, 94)

    // General election.
    check(0, 281, 108)

    // Date of general election.
    text('11', 0, 208, 121)
    text('03', 0, 258, 121)
    text('2020', 0, 300, 121)

    // 'in the city/county of:' (locale)
    text(stateInfo.county ? stateInfo.county : '', 0, 450, 121)

    // 'No' to all elections this calendar year because the general is the only one left.
    check(0, 409, 134)

    // Street and street number.
    const streetAddress = stateInfo.address.streetNumber + ' ' + stateInfo.address.street
    text(streetAddress, 0, 170, 178)
    // Apt/suite
    text(stateInfo.address.unit ? stateInfo.address.unit : '', 0, 540, 178)
    // City
    text(stateInfo.address.city ? stateInfo.address.city : ' ', 0, 170, 196)
    // Zip code.
    text(stateInfo.address.postcode[0], 0, 409, 196)
    text(stateInfo.address.postcode[1], 0, 431, 196)
    text(stateInfo.address.postcode[2], 0, 453, 196)
    text(stateInfo.address.postcode[3], 0, 475, 196)
    text(stateInfo.address.postcode[4], 0, 497, 196)

    // Mailing address.
    if (stateInfo.mailingAddress) {
        text(stateInfo.mailingAddress, 0, 170, 228)
    } else {
        text('Same as above', 0, 170, 228)
    }

    // Phone number.
    const phoneNumber = cleanPhoneNumber(stateInfo.phone)
    text(phoneNumber[0], 0, 184, 268)
    text(phoneNumber[1], 0, 206, 268)
    text(phoneNumber[2], 0, 228, 268)
    text(phoneNumber[3], 0, 269, 268)
    text(phoneNumber[4], 0, 291, 268)
    text(phoneNumber[5], 0, 313, 268)
    text(phoneNumber[6], 0, 352, 268)
    text(phoneNumber[7], 0, 374, 268)
    text(phoneNumber[8], 0, 396, 268)
    text(phoneNumber[9], 0, 418, 268)

    // Email.
    text(stateInfo.email, 0, 184, 284)

    // Signed date.
    const signedDate = new Date().toISOString().split('T')[0].split('-')
    text(signedDate[1], 0, 480, 675)
    text(signedDate[2], 0, 520, 675)
    text(signedDate[0], 0, 560, 675)

    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 150, 30)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 265, 690)
  }
)
