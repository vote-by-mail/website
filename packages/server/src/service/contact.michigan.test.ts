import { getMichiganContact } from './contact'
import { cacheGeocode, toAddress } from './gm'
import { AddressInputParts } from '../common'

type AddressExpected = AddressInputParts & { expected: string }

// from: https://en.wikipedia.org/wiki/List_of_municipalities_in_Michigan
const addresses: AddressExpected[] = [
  {
    street: '2648 W Grand Blvd',
    city: 'Detroit',
    state: 'MI',
    postcode: '48208',
    expected: 'Detroit City:Wayne County'
  },
  {
    street: '834 Leonard St NE',
    city: 'Grand Rapids',
    state: 'MI',
    postcode: '49503',
    expected: 'Grand Rapids City:Kent County'
  },
  {
    street: '30100 Campbell Ave',
    city: 'Warren',
    state: 'MI',
    postcode: '48093',
    expected: 'Warren City:Macomb County'
  },
  {
    street: '5150 Rudgate Cir',
    city: 'Sterling Heights',
    state: 'MI',
    postcode: '48310',
    expected: 'Sterling Heights City:Macomb County'
  },
  {
    street: '4230 S Martin Luther King Jr Blvd',
    city: 'Lansing',
    state: 'MI',
    postcode: '48910',
    expected: 'Lansing City:Ingham County'
  },
  {
    street: '1120 E Kearsley St',
    city: 'Flint',
    state: 'MI',
    postcode: '48503',
    expected: 'Flint City:Genesee County'
  },
  {
    street: '1231 Van Dusen Dr',
    city: 'Ann Arbor',
    state: 'MI',
    postcode: '48103',
    expected: 'Ann Arbor City:Washtenaw County'
  },
  {
    street: '15264 Michigan Ave',
    city: 'Dearborn',
    state: 'MI',
    postcode: '48126',
    expected: 'Dearborn City:Wayne County'
  },
  {
    street: '35301 Five Mile Rd',
    city: 'Livonia',
    state: 'MI',
    postcode: '48154',
    expected: 'Livonia City:Wayne County'
  },
  {
    street: '43350 Elizabeth Rd',
    city: 'Clinton Twp',
    state: 'MI',
    postcode: '48036',
    expected: 'Clinton Township:Macomb County'
  },
  {
    street: '44500 Cherry Hill Rd',
    city: 'Canton',
    state: 'MI',
    postcode: '48187',
    expected: 'Canton Township:Wayne County'
  },
  {
    street: '17051 24 Mile Rd',
    city: 'Macomb',
    state: 'MI',
    postcode: '48042',
    expected: 'Macomb Township:Macomb County'
  },
  {
    street: '46155 Schoenherr Rd',
    city: 'Shelby Charter Twp',
    state: 'MI',
    postcode: '48315',
    expected: 'Shelby Charter Township:Macomb County'
  },
  {
    street: '3882 Highland Rd',
    city: 'Waterford Twp',
    state: 'MI',
    postcode: '48328',
    expected: 'Waterford Township:Oakland County'
  },
  {
    street: '4100 Walnut Lake Rd',
    city: 'West Bloomfield Township',
    state: 'MI',
    postcode: '48323',
    expected: 'West Bloomfield Township:Oakland County'
  },
  {
    street: '20 N Washington St',
    city: 'Ypsilanti',
    state: 'MI',
    postcode: '48197',
    expected: 'Ypsilanti City:Washtenaw County'
  },
  {
    street: '7180 S Huron River Dr',
    city: 'Ypsilanti',
    state: 'MI',
    postcode: '48197',
    expected: 'Ypsilanti Township:Washtenaw County'
  },
  {
    street: '14841 Beech Daly',
    city: 'Redford Charter Twp',
    state: 'MI',
    postcode: '48239',
    expected: 'Redford Township:Wayne County'
  },
  {
    street: '2766 Baldwin St',
    city: 'Jenison',
    state: 'MI',
    postcode: '49428',
    expected: 'Georgetown Township:Ottawa County'
  },
  {
    street: '54205 Washington St',
    city: 'Chesterfield',
    state: 'MI',
    postcode: '48047',
    expected: 'Chesterfield Township:Macomb County'
  },
  {
    street: '3600 Telegraph Rd',
    city: 'Bloomfield Twp',
    state: 'MI',
    postcode: '48302',
    expected: 'Bloomfield Township:Oakland County'
  },
  {
    street: '4873 N Center Rd',
    city: 'Saginaw',
    state: 'MI',
    postcode: '48608',
    expected: 'Saginaw Township:Saginaw County'
  },
  {
    street: '1155 N Commerce Rd',
    city: 'Commerce Charter Twp',
    state: 'MI',
    postcode: '48382',
    expected: 'Commerce Township:Oakland County'
  },
  {
    street: '5165 Marsh Rd',
    city: 'Okemos',
    state: 'MI',
    postcode: '48864',
    expected: 'Meridian Township:Ingham County'
  },
  {
    street: '515 Bush Ave',
    city: 'Grand Blanc',
    state: 'MI',
    postcode: '48439',
    expected: 'Grand Blanc City:Genesee County'
  },
  {
    street: '6106 S Saginaw St',
    city: 'Grand Blanc',
    state: 'MI',
    postcode: '48439',
    expected: 'Grand Blanc Township:Genesee County'
  },
  {
    street: '12251 James Street',
    city: 'Holland',
    state: 'MI',
    postcode: '49424',
    expected: 'Holland Township:Ottawa County'
  },
  {
    street: '12220 Fillmore Street',
    city: 'Room 130, West Olive',
    state: 'MI',
    postcode: '49460',
    expected: 'Olive Township:Ottawa County'
  },
  {
    street: '414 Washington Ave',
    city: 'Room 115, Grand Haven',
    state: 'MI',
    postcode: '49417',
    expected: 'Grand Haven City:Ottawa County'
  },
  {
    street: '3920 Baldwin Rd',
    city: 'Orion Charter Township',
    state: 'MI',
    postcode: '48359',
    expected: 'Orion Township:Oakland County'
  },
  {
    street: '5464 Waterford Rd',
    city: 'Independence Charter Township',
    state: 'MI',
    postcode: '48346',
    expected: 'Independence Township:Oakland County'
  },
  {
    street: '1000 S Canal Rd',
    city: 'Lansing',
    state: 'MI',
    postcode: '48917',
    expected: 'Delta Charter Township:Eaton County'
  },
  {
    street: '4313 Corunna Rd',
    city: 'Flint',
    state: 'MI',
    postcode: '48532',
    expected: 'Flint Township:Genesee County'
  },
  {
    street: '8970 Jackman Rd',
    city: 'Temperance',
    state: 'MI',
    postcode: '48182',
    expected: 'Bedford Township:Monroe County'
  },
  {
    street: '6390 Belmont Ave NE',
    city: 'Belmont',
    state: 'MI',
    postcode: '49306',
    expected: 'Plainfield Township:Kent County'
  },
  {
    street: '4411 Plainfield Ave NE',
    city: 'Grand Rapids',
    state: 'MI',
    postcode: '49525',
    expected: 'Plainfield Township:Kent County'
  },
  {
    street: '21516 Telegraph Rd',
    city: 'Brownstown Charter Twp',
    state: 'MI',
    postcode: '48183',
    expected: 'Brownstown Township:Wayne County'
  },
  {
    street: '32414 W Jefferson Ave',
    city: 'Rockwood',
    state: 'MI',
    postcode: '48173',
    expected: 'Brownstown Township:Wayne County'
  },
  {
    street: '1730 Mead Ln',
    city: 'White Lake',
    state: 'MI',
    postcode: '48386',
    expected: 'White Lake Township:Oakland County'
  },
  {
    street: '2376 Westbrooke Cir N',
    city: 'Ann Arbor',
    state: 'MI',
    postcode: '48105',
    expected: 'Ann Arbor Township:Washtenaw County'
  },
  {
    street: '21385 Glen Lodge Rd',
    city: 'Ferndale',
    state: 'MI',
    postcode: '48220',
    expected: 'Royal Oak Township:Oakland County'
  },
  {
    street: '10995 W Jefferson Ave',
    city: 'River Rouge',
    state: 'MI',
    postcode: '48229',
    expected: 'River Rouge City:Wayne County'
  },
  {
    street: '916 Parkview Ave',
    city: 'Battle Creek',
    state: 'MI',
    postcode: '49017',
    expected: 'Pennfield Township:Calhoun County'
  },
  {
    street: '117 W Prudence Ln',
    city: 'Battle Creek',
    state: 'MI',
    postcode: '49037',
    expected: 'Bedford Township:Calhoun County'
  },
  {
    street: '954 Baldwin St',
    city: 'Traverse City',
    state: 'MI',
    postcode: '49686',
    expected: 'Traverse City City:Grand Traverse County'
  },
]

test.each(addresses)(
  'Checking Michigan Geocoding %s',
  async (addr) => {
    jest.setTimeout(10000)

    // This function breaks up geocoding into it's parts so that we can cache and get errMsg
    const geoResult = await cacheGeocode(addr)
    expect(geoResult).toBeTruthy()
    const errMsg = `Google Result was ${JSON.stringify(geoResult?.address_components, null, 2)}`

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const address = toAddress(geoResult!)
    expect(address, errMsg).toBeTruthy()
    expect(address?.latLong, errMsg).toBeTruthy()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const contact = await getMichiganContact(address?.latLong!, address?.county!, {cacheQuery: true})

    expect(contact, errMsg).toBeTruthy()
    expect(
      contact?.city + ':' + contact?.county,
      errMsg,
    ).toEqual(addr.expected)
  }
)
