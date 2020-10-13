import { getArcGisContact } from './contact'
import { cacheGeocode, toAddress } from './gm'
import { AddressInputParts } from '../common'

type AddressExpected = AddressInputParts & { expected: string }

const addresses: AddressExpected[] = [
  // Municipalities
  // from: https://en.wikipedia.org/wiki/List_of_municipalities_in_Wisconsin
  {
    street: '305 E Slifer St',
    city: 'Portage',
    postcode: '53901',
    state: 'Wisconsin',
    expected: 'City of Portage:Columbia County',
  },
  {
    street: '9039 W National Ave',
    city: `West Allis`,
    postcode: '53227',
    state: 'Wisconsin',
    expected: 'City of West Allis:Milwaukee County',
  },
  {
    street: '16805 W Observatory Rd',
    city: 'New Berlin',
    postcode: '53151',
    state: 'Wisconsin',
    expected: 'City of New Berlin:Waukesha County',
  },
  {
    street: 'N85W16063 Appleton Ave',
    city: 'Menomonee Falls',
    postcode: '53051',
    state: 'Wisconsin',
    expected: 'Village of Menomonee Falls:Waukesha County',
  },
  {
    street: '2422 Monroe St',
    city: 'Madison',
    postcode: '53711',
    state: 'Wisconsin',
    expected: 'City of Madison:Dane County',
  },
  {
    street: '820 17th Ave E',
    city: 'Menomonie',
    postcode: '54751',
    state: 'Wisconsin',
    expected: 'City of Menomonie:Dunn County',
  },
  {
    street: '108 17th Ave S',
    city: 'Onalaska',
    postcode: '54650',
    state: 'Wisconsin',
    expected: 'City of Onalaska:La Crosse County',
  },
  {
    street: '4100 Highland Rd',
    city: 'Mequon',
    postcode: '53092',
    state: 'Wisconsin',
    expected: 'City of Mequon:Ozaukee County',
  },

  // Cities
  // from: https://en.wikipedia.org/wiki/List_of_cities_in_Wisconsin
  {
    street: '1842 Western Ave',
    city: 'Green Bay',
    postcode: '54303',
    state: 'Wisconsin',
    expected: 'City of Green Bay:Brown County',
  },
  {
    street: '20037 Gibson St',
    city: 'Galesville',
    postcode: '54630',
    state: 'Wisconsin',
    expected: 'City of Galesville:Trempealeau County',
  },
  {
    street: '528 W Water St',
    city: 'Princeton',
    postcode: '54968',
    state: 'Wisconsin',
    expected: 'City of Princeton:Green Lake County',
  },
  {
    street: '1 S Pinckney St',
    city: 'Madison',
    postcode: '53703',
    state: 'Wisconsin',
    expected: 'City of Madison:Dane County',
  },
  {
    street: '300 N Broadway',
    city: 'Green Bay',
    postcode: '54303',
    state: 'Wisconsin',
    expected: 'City of Green Bay:Brown County',
  },
  {
    street: '715 Fairwood Dr',
    city: 'Neenah',
    postcode: '54956',
    state: 'Wisconsin',
    expected: 'City of Neenah:Winnebago County',
  },
]

beforeAll(() => jest.setTimeout(10000))

test.each(addresses)(
  'Checking Wisconsin Geocoding',
  async (addr) => {
    // This function breaks up geocoding into its parts so that we can cache and get errMsg
    const geoResult = await cacheGeocode(addr)
    expect(geoResult).toBeTruthy()
    const errMsg = `Google Result was ${JSON.stringify(geoResult?.address_components, null, 2)}`

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const address = toAddress(geoResult!)
    expect(address, errMsg).toBeTruthy()
    expect(address?.latLong, errMsg).toBeTruthy()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const contact = await getArcGisContact(address?.latLong!, address?.county!, 'Wisconsin', {cacheQuery: true})

    expect(contact, errMsg).toBeTruthy()
    expect(
      contact?.city + ':' + contact?.county,
      errMsg,
    ).toEqual(addr.expected)
  }
)
