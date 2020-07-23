import { Address, sampleAddresses, toAddressStr, toLocale, toContactMethod, AvailableState, isAvailableState, Locale, AddressData } from '../../common'
import { testEach } from '../utilTests'
import { toContact } from '.'
import { cacheGeocode, toAddress } from '../gm'


describe('Google Maps is returning stable results', () => {
  const table: AddressData[] = Object
    .values(sampleAddresses)
    .reduce((x, y) => x.concat(y))

  testEach(table)(
    'Checking Geocoding for %s',
    async (addrData) => {
      const {state, county, city} = addrData
      const address = toAddressStr(addrData)
      const geoResult = await cacheGeocode(address)
      expect(geoResult).toBeTruthy()
      if (!geoResult) return
      const result = toAddress(geoResult)
      expect(result).toBeTruthy()
      if (!result) return
      const locale = toLocale(result as Address)
      expect(locale).toBeTruthy()
      expect(locale?.state).toEqual(state)
      expect(locale?.county).toEqual(county)
      expect(locale?.city).toEqual(city)
      expect(isAvailableState((locale as Locale).state)).toBeTruthy()
      const contact = await toContact(locale as Locale<AvailableState>)
      expect(contact).toBeTruthy()
      const method = toContactMethod(contact)
      expect(method).toBeTruthy()
    }
  )
})
