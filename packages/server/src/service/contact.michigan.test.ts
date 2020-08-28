import { getMichiganContact } from './contact'
import { cacheGeocode, toAddress } from './gm'
import { AddressInputParts } from '../common'

type AddressExpected = AddressInputParts & { expected: string }

// from: https://en.wikipedia.org/wiki/List_of_municipalities_in_Michigan
const addresses: AddressExpected[] = [
  {
    street: 'Grand Blvd',
    streetNumber: '2648 W',
    city: 'Detroit',
    state: 'MI',
    postcode: '48208',
    expected: 'Detroit City:Wayne County'
  },
  {
    street: 'Leonard St NE',
    streetNumber: '834',
    city: 'Grand Rapids',
    state: 'MI',
    postcode: '49503',
    expected: 'Grand Rapids City:Kent County'
  },
  {
    street: 'Campbell Ave',
    streetNumber: '30100',
    city: 'Warren',
    state: 'MI',
    postcode: '48093',
    expected: 'Warren City:Macomb County'
  },
  {
    street: 'Rudgate Cir',
    streetNumber: '5150',
    city: 'Sterling Heights',
    state: 'MI',
    postcode: '48310',
    expected: 'Sterling Heights City:Macomb County'
  },
  {
    street: 'Martin Luther King Jr Blvd',
    streetNumber: '4230 S',
    city: 'Lansing',
    state: 'MI',
    postcode: '48910',
    expected: 'Lansing City:Ingham County'
  },
  {
    street: 'Kearsley St',
    streetNumber: '1120 E',
    city: 'Flint',
    state: 'MI',
    postcode: '48503',
    expected: 'Flint City:Genesee County'
  },
  {
    street: 'Van Dusen Dr',
    streetNumber: '1231',
    city: 'Ann Arbor',
    state: 'MI',
    postcode: '48103',
    expected: 'Ann Arbor City:Washtenaw County'
  },
  {
    street: 'Michigan Ave',
    streetNumber: '15264',
    city: 'Dearborn',
    state: 'MI',
    postcode: '48126',
    expected: 'Dearborn City:Wayne County'
  },
  {
    street: 'Five Mile Rd',
    streetNumber: '35301',
    city: 'Livonia',
    state: 'MI',
    postcode: '48154',
    expected: 'Livonia City:Wayne County'
  },
  {
    street: 'Elizabeth Rd',
    streetNumber: '43350',
    city: 'Clinton Twp',
    state: 'MI',
    postcode: '48036',
    expected: 'Clinton Township:Macomb County'
  },
  {
    street: 'Cherry Hill Rd',
    streetNumber: '44500',
    city: 'Canton',
    state: 'MI',
    postcode: '48187',
    expected: 'Canton Township:Wayne County'
  },
  {
    street: '24 Mile Rd',
    streetNumber: '17051',
    city: 'Macomb',
    state: 'MI',
    postcode: '48042',
    expected: 'Macomb Township:Macomb County'
  },
  {
    street: 'Schoenherr Rd',
    streetNumber: '46155',
    city: 'Shelby Charter Twp',
    state: 'MI',
    postcode: '48315',
    expected: 'Shelby Charter Township:Macomb County'
  },
  {
    street: 'Highland Rd',
    streetNumber: '3882',
    city: 'Waterford Twp',
    state: 'MI',
    postcode: '48328',
    expected: 'Waterford Township:Oakland County'
  },
  {
    street: 'Walnut Lake Rd',
    streetNumber: '4100',
    city: 'West Bloomfield Township',
    state: 'MI',
    postcode: '48323',
    expected: 'West Bloomfield Township:Oakland County'
  },
  {
    street: 'Washington St',
    streetNumber: '20 N',
    city: 'Ypsilanti',
    state: 'MI',
    postcode: '48197',
    expected: 'Ypsilanti City:Washtenaw County'
  },
  {
    street: 'Huron River Dr',
    streetNumber: '7180 S',
    city: 'Ypsilanti',
    state: 'MI',
    postcode: '48197',
    expected: 'Ypsilanti Township:Washtenaw County'
  },
  {
    street: 'Beech Daly',
    streetNumber: '14841',
    city: 'Redford Charter Twp',
    state: 'MI',
    postcode: '48239',
    expected: 'Redford Township:Wayne County'
  },
  {
    street: 'Baldwin St',
    streetNumber: '2766',
    city: 'Jenison',
    state: 'MI',
    postcode: '49428',
    expected: 'Georgetown Township:Ottawa County'
  },
  {
    street: 'Washington St',
    streetNumber: '54205',
    city: 'Chesterfield',
    state: 'MI',
    postcode: '48047',
    expected: 'Chesterfield Township:Macomb County'
  },
  {
    street: 'Telegraph Rd',
    streetNumber: '3600',
    city: 'Bloomfield Twp',
    state: 'MI',
    postcode: '48302',
    expected: 'Bloomfield Township:Oakland County'
  },
  {
    street: 'Center Rd',
    streetNumber: '4873 N',
    city: 'Saginaw',
    state: 'MI',
    postcode: '48608',
    expected: 'Saginaw Township:Saginaw County'
  },
  {
    street: 'Commerce Rd',
    streetNumber: '1155 N',
    city: 'Commerce Charter Twp',
    state: 'MI',
    postcode: '48382',
    expected: 'Commerce Township:Oakland County'
  },
  {
    street: 'Marsh Rd',
    streetNumber: '5165',
    city: 'Okemos',
    state: 'MI',
    postcode: '48864',
    expected: 'Meridian Township:Ingham County'
  },
  {
    street: 'Bush Ave',
    streetNumber: '515',
    city: 'Grand Blanc',
    state: 'MI',
    postcode: '48439',
    expected: 'Grand Blanc City:Genesee County'
  },
  {
    street: 'Saginaw St',
    streetNumber: '6106 S',
    city: 'Grand Blanc',
    state: 'MI',
    postcode: '48439',
    expected: 'Grand Blanc Township:Genesee County'
  },
  {
    street: 'James Street',
    streetNumber: '12251',
    city: 'Holland',
    state: 'MI',
    postcode: '49424',
    expected: 'Holland Township:Ottawa County'
  },
  {
    street: 'Fillmore Street',
    streetNumber: '12220',
    city: 'Room 130, West Olive',
    state: 'MI',
    postcode: '49460',
    expected: 'Olive Township:Ottawa County'
  },
  {
    street: 'Washington Ave',
    streetNumber: '414',
    city: 'Room 115, Grand Haven',
    state: 'MI',
    postcode: '49417',
    expected: 'Grand Haven City:Ottawa County'
  },
  {
    street: 'Baldwin Rd',
    streetNumber: '3920',
    city: 'Orion Charter Township',
    state: 'MI',
    postcode: '48359',
    expected: 'Orion Township:Oakland County'
  },
  {
    street: 'Waterford Rd',
    streetNumber: '5464',
    city: 'Independence Charter Township',
    state: 'MI',
    postcode: '48346',
    expected: 'Independence Township:Oakland County'
  },
  {
    street: 'Canal Rd',
    streetNumber: '1000 S',
    city: 'Lansing',
    state: 'MI',
    postcode: '48917',
    expected: 'Delta Charter Township:Eaton County'
  },
  {
    street: 'Corunna Rd',
    streetNumber: '4313',
    city: 'Flint',
    state: 'MI',
    postcode: '48532',
    expected: 'Flint Township:Genesee County'
  },
  {
    street: 'Jackman Rd',
    streetNumber: '8970',
    city: 'Temperance',
    state: 'MI',
    postcode: '48182',
    expected: 'Bedford Township:Monroe County'
  },
  {
    street: 'Belmont Ave NE',
    streetNumber: '6390',
    city: 'Belmont',
    state: 'MI',
    postcode: '49306',
    expected: 'Plainfield Township:Kent County'
  },
  {
    street: 'Plainfield Ave NE',
    streetNumber: '4411',
    city: 'Grand Rapids',
    state: 'MI',
    postcode: '49525',
    expected: 'Plainfield Township:Kent County'
  },
  {
    street: 'Telegraph Rd',
    streetNumber: '21516',
    city: 'Brownstown Charter Twp',
    state: 'MI',
    postcode: '48183',
    expected: 'Brownstown Township:Wayne County'
  },
  {
    street: 'Jefferson Ave',
    streetNumber: '32414 W',
    city: 'Rockwood',
    state: 'MI',
    postcode: '48173',
    expected: 'Brownstown Township:Wayne County'
  },
  {
    street: 'Mead Ln',
    streetNumber: '1730',
    city: 'White Lake',
    state: 'MI',
    postcode: '48386',
    expected: 'White Lake Township:Oakland County'
  },
  {
    street: 'Westbrooke Cir N',
    streetNumber: '2376',
    city: 'Ann Arbor',
    state: 'MI',
    postcode: '48105',
    expected: 'Ann Arbor Township:Washtenaw County'
  },
  {
    street: 'Glen Lodge Rd',
    streetNumber: '21385',
    city: 'Ferndale',
    state: 'MI',
    postcode: '48220',
    expected: 'Royal Oak Township:Oakland County'
  },
  {
    street: 'Jefferson Ave',
    streetNumber: '10995 W',
    city: 'River Rouge',
    state: 'MI',
    postcode: '48229',
    expected: 'River Rouge City:Wayne County'
  },
  {
    street: 'Parkview Ave',
    streetNumber: '916',
    city: 'Battle Creek',
    state: 'MI',
    postcode: '49017',
    expected: 'Pennfield Township:Calhoun County'
  },
  {
    street: 'Prudence Ln',
    streetNumber: '117 W',
    city: 'Battle Creek',
    state: 'MI',
    postcode: '49037',
    expected: 'Bedford Township:Calhoun County'
  },
  {
    street: 'Baldwin St',
    streetNumber: '954',
    city: 'Traverse City',
    state: 'MI',
    postcode: '49686',
    expected: 'Traverse City City:Grand Traverse County'
  },
]

test.each(addresses)(
  'Checking Michigan Geocoding %s',
  async (addr) => {
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
