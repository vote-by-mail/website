import { WestVirginiaInfo, getStateAbbr, State } from '../../common'
import { fillFormWrapper  } from '.'
import { cleanPhoneNumber, toSignatureBuffer } from './util'

export const fillWestVirginia = (
  stateInfo: WestVirginiaInfo
) => fillFormWrapper(
  'West_Virginia.pdf',
  async ({check, text, placeImage}) => {

    const { nameParts } = stateInfo

    // First name.
    text(nameParts.first, 0, 277, 117)
    // Middle initial.
    if (nameParts.middle) {
      text(nameParts.middle, 0, 432, 117)
    }
    // Last name.
    text(nameParts.last, 0, 132, 117)
    // Suffix.
    if (nameParts.suffix) {
      text(nameParts.suffix, 0, 572, 117)
    }

    // Birth year.
    const birthMonth = stateInfo.birthdate.split('/')[0]
    const birthDay = stateInfo.birthdate.split('/')[1]
    const birthYear = stateInfo.birthdate.split('/')[2]
    text(birthMonth, 0, 480, 154)
    text(birthDay, 0, 515, 154)
    text(birthYear, 0, 547, 154)

    // 'in the city/county of:' (locale)
    text(stateInfo.county ? stateInfo.county : '', 0, 460, 137)

    // Street and street number.
    const streetAddress = stateInfo.address.streetNumber + ' ' + stateInfo.address.street + (stateInfo.address.unit ? ',' : '')
    const streetAddressStart = 195
    text(streetAddress, 0, streetAddressStart, 137)
    // Apt/suite
    const addressPosition = streetAddress.length * 7 + streetAddressStart
    text(stateInfo.address.unit ? stateInfo.address.unit : '', 0, addressPosition, 137)
    // City
    text(stateInfo.address.city ? stateInfo.address.city : ' ', 0, 130, 154)
    // Zip code.
    text(stateInfo.address.postcode, 0, 367, 154)

    const mailingAddressStart = 150
    if (stateInfo.mailingAddressParts) {
        // Mailing address.
        const { city, street, unit, postcode, state } = stateInfo.mailingAddressParts
        const mailingStateAbbr = getStateAbbr(state as State)
        const address = unit ? `${street} # ${unit}` : street
        text(address, 0, mailingAddressStart, 175)
        text(city, 0, mailingAddressStart * 0.95, 192)
        text(mailingStateAbbr ?? state ?? '', 0, mailingAddressStart * 2, 192)
        text(postcode, 0, 367, 192)
    } else if (stateInfo.mailingAddress) {
        text(stateInfo.mailingAddress, 0, mailingAddressStart, 175)
    } else {
        text(streetAddress, 0, mailingAddressStart, 175)
        // Apt/suite
        const mailingPosition = streetAddress.length * 7 + mailingAddressStart
        text(stateInfo.address.unit ? stateInfo.address.unit : '', 0, mailingPosition, 175)
        // City
         text(stateInfo.address.city ? stateInfo.address.city : ' ', 0, 130, 192)
        // state
        text("WV", 0, 295, 192)
        // Zip code.
        text(stateInfo.address.postcode, 0, 367, 192)
    }

    // Phone number.
    text(cleanPhoneNumber(stateInfo.phone), 0, 460, 175)

    // Reason for election - Covid19
    check(0, 130, 218)

    // election
    if (stateInfo.election){
        // If election is specified, and user specified Federal/State/County
        if (stateInfo.election == 'Federal/State/County') {
            check(0, 114, 480)
        // If election is specified, and user specified City/Town
        } else {
            check(0, 114, 492)
        }
    // If election is not specified, default to Federal/State/County
    } else {
        check(0, 114, 480)
    }

    if (stateInfo.electionType){
        // If electionType is specified, and user specified General
        if (stateInfo.electionType == 'General') {
            check(0, 210, 503)
        // If electionType is specified, and user specified Primary
        } else if (stateInfo.electionType == 'Primary') {
            check(0, 210, 491)
            // If Primary is chosen, and user picked Democratic
            if (stateInfo.party == 'Democratic Party') {
                check(0, 350, 563)
            // If Primary is chosen, and user picked Republican
            } else if (stateInfo.party == 'Republican Party') {
                check(0, 405, 563)
            // If Primary is chosen, and user picked Mountain
            } else {
                check(0, 464, 563)
            }
        // If electionType is specified, and user specified Special
        } else {
            check(0, 210, 515)
        }
    // If electionType is not specified, default to General
    } else {
        check(0, 210, 503)
    }

    // Signed date.
    const signedDate = new Date().toISOString().split('T')[0]
    text(signedDate, 0, 535, 635)

    const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 150, 30)
    await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 325, 642)
  }
)
