import { NorthDakotaInfo, getStateAbbr, State } from '../../common'
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
    const { first, middle, last, suffix } = nameParts
    // ignores undefined/empty name parts
    const name = [first, middle, last, suffix].filter(e => !!e).join(' ')
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

    // It will always be defined since this state was implemented after the changes
    // that introduced addressParts
    if (stateInfo.address.addressParts) {
        const { city, postcode, state, street, unit } = stateInfo.address.addressParts

        const stateAbbr = getStateAbbr(state as State)
        const address = unit
            ? `${street} #${unit}`
            : `${street}`

        text(address, 0, 25, 325)
        text(city, 0, 320, 325)
        text(stateAbbr ?? state, 0, 450, 325)
        text(postcode, 0, 500, 325)
    }

    // using mailing address parts because mailing address is of type string instead of Address
    if(stateInfo.mailingAddressParts) {
        const { city, postcode, state, street, unit } = stateInfo.mailingAddressParts
        const stateAbbr = getStateAbbr(state as State)
        const address = unit
            ? `${street} #${unit}`
            : `${street}`

        text(address, 0, 25, 353)
        text(city, 0, 320, 353)
        text(stateAbbr ?? state, 0, 450, 353)
        text(postcode, 0, 500, 353)
    }

    //  // Signed date.
     const signedDate = new Date().toISOString().split('T')[0]
     text(signedDate, 0, 450, 403)

     const signatureBuffer = await toSignatureBuffer(stateInfo.signature, 150, 30)
     await placeImage(new Uint8Array(signatureBuffer.buffer), 0, 148, 406)
})
