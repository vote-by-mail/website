import { NorthDakotaInfo } from '../../common'
import { fillFormWrapper } from '.'
import { cleanPhoneNumber, toSignatureBuffer } from './util'

export const fillNorthDakota = ( stateInfo: NorthDakotaInfo) => fillFormWrapper('NorthDakota.pdf', async ({ check, text, placeImage}) => {
    const { nameParts } = stateInfo

    //Election Type
    if(stateInfo.electionType) {
        if(stateInfo.electionType === 'Primary') {
            check(0, 38, 147)
        } else if(stateInfo.electionType === 'General') {
            check(0, 38, 163)
        } else if(stateInfo.electionType === 'Both') {
            // All Statewide Elections Option
            check(0, 281, 153)
        } else if(stateInfo.electionType === 'City') {
            check(0, 443, 137)
        } else if(stateInfo.electionType === 'School') {
            check(0, 443, 153)
        } else if(stateInfo.electionType === 'Special') {
            check(0, 443, 170)
        } else {
            // default to general
            check(0, 38, 163)
        }
    }
    // Name.
    const name = `${nameParts.first} ${nameParts.middle} ${nameParts.last} ${nameParts.suffix}`
    text(name, 0, 25, 220)
 
    // Birthdate.
    text(stateInfo.birthdate, 0, 340, 220)

    //  Phone number.
    text(cleanPhoneNumber(stateInfo.phone), 0, 460, 220)

    // ID Type
    if(stateInfo.idType === 'North Dakota License Number') {
        check(0, 38, 246)
    } else if(stateInfo.idType === 'Non Driver ID') {
        check(0, 148, 246)
    } else {
        // Tribal ID Number
        check(0, 443, 246)
    }

    // ID Number
    text(stateInfo.idNumber, 0, 25, 300)

    const streetAddress = stateInfo.address.unit 
                            ? `${stateInfo.address.streetNumber} ${stateInfo.address.street}, ${stateInfo.address.unit}`
                            : `${stateInfo.address.streetNumber} ${stateInfo.address.street}` 
    text(streetAddress, 0,25, 325)

    // using mailing address parts because mailing address is of type string instead of Address
    if(stateInfo.mailingAddress && stateInfo.mailingAddressParts) {
        const deliveryAddress = stateInfo.mailingAddressParts.unit 
        ? `${stateInfo.mailingAddressParts.street}, ${stateInfo.mailingAddressParts.unit}`
        : `${stateInfo.mailingAddressParts.street}`

        text(deliveryAddress, 0,25, 350)
    }

    //  // Signed date.
     const signedDate = new Date().toISOString().split('T')[0]
     text(signedDate, 0, 450, 403)
 
     const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 150, 30)
     await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 148, 406)
})