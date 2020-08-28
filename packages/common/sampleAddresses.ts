import { Locale } from "./locale"
import { ImplementedState } from "./stateInfo"

export interface AddressData extends Locale<ImplementedState> {
  address: string
  postcode: string
  street: string
  streetNumber: string
  unit?: string
}

// The Chamber of Commerce for the 3 largest cities in the state
// and others addresses as necessary
export const sampleAddresses: Record<ImplementedState, AddressData[]> = {
  'Arizona': [{
    address: '201 N Central Ave, Phoenix, AZ 85004',
    city: 'Phoenix',
    county: 'Maricopa County',
    postcode: '85004',
    street: 'Central Ave',
    streetNumber: '201 N',
    state: 'Arizona',
  }, {
    address: '212 E Broadway Blvd, Tucson, AZ 85701',
    city: 'Tucson',
    county: 'Pima County',
    postcode: '85701',
    street: 'Broadway Blvd',
    streetNumber: '212 E',
    state: 'Arizona',
  }, {
    address: '165 N Centennial Way, Mesa, AZ 85201',
    city: 'Mesa',
    county: 'Maricopa County',
    postcode: '85201',
    street: 'Centennial Way',
    streetNumber: '165 N',
    state: 'Arizona',
  }],
  'Florida': [{
    address: '100 S Biscayne Blvd, Miami, FL 33131',
    city: 'Miami',
    county: 'Miami-Dade County',
    postcode: '33131',
    street: 'Biscayne Blvd',
    streetNumber: '100 S',
    state: 'Florida',
  }, {
    address: '5443 Main St, Port Richey, FL 34652',
    city: 'Port Richey',
    county: 'Pasco County',
    postcode: '34652',
    street: 'Main St',
    streetNumber: '5443',
    state: 'Florida',
  }, {
    address: '2000 W Commercial Blvd, Fort Lauderdale, FL 33309',
    city: 'Fort Lauderdale',
    county: 'Broward County',
    postcode: '33309',
    street: 'Commercial Blvd',
    streetNumber: '2000 W',
    state: 'Florida',
  }],
  'Michigan': [{
    address: '45525 Hanford Rd, Canton, MI 48187',
    city: 'Canton',
    county: 'Wayne County',
    postcode: '48187',
    street: 'Hanford Rd',
    streetNumber: '45525',
    state: 'Michigan',
  }, {
    address: '24624 W Warren St, Dearborn Heights 48127, MI',
    city: 'Dearborn Heights',
    county: 'Wayne County',
    postcode: '48127',
    street: 'Warren St',
    streetNumber: '24624 W',
    state: 'Michigan',
  }, {
    address: '22100 Michigan Ave. Dearborn, MI 48124',
    city: 'Dearborn',
    county: 'Wayne County',
    postcode: '48124',
    street: 'Michigan Ave.',
    streetNumber: '22100',
    state: 'Michigan',
  }, {
    address: '700 Broad Street St Joseph, MI 49085',
    city: 'St. Joseph',
    county: 'Berrien County',
    postcode: '49085',
    street: 'Broad Street',
    streetNumber: '700',
    state: 'Michigan',
  }, {
    address: '2724 Peck St, MI 49444',
    city: 'Muskegon Heights',
    county: 'Muskegon County',
    postcode: '49444',
    street: 'Peck St',
    streetNumber: '2724',
    state: 'Michigan',
  }],
  'Georgia': [{
    address: '191 Peachtree St NE, Atlanta, GA 30303',
    city: 'Atlanta',
    county: 'Fulton County',
    postcode: '30303',
    street: 'Peachtree St',
    streetNumber: '191',
    state: 'Georgia',
  }, {
    address: '1 10th St, Augusta, GA 30901',
    city: 'Augusta',
    county: 'Richmond County',
    postcode: '30901',
    street: '10th St',
    streetNumber: '1',
    state: 'Georgia',
  }, {
    address: '1200 6th Ave, Columbus, GA 31902',
    city: 'Columbus',
    county: 'Muscogee County',
    postcode: '31902',
    street: '6th Ave',
    streetNumber: '1200',
    state: 'Georgia',
  }, {
    address: '305 Coliseum Dr, Macon, GA 31217',
    city: 'Macon',
    county: 'Bibb County',
    postcode: '31217',
    street: 'Coliseum Dr',
    streetNumber: '305',
    state: 'Georgia',
  }],
  'Kansas': [{
    address: '727 Minnesota Ave, Kansas City, KS 66101',
    city: 'Kansas City',
    county: 'Wyandotte County',
    postcode: '66101',
    street: 'Minnesota Ave',
    streetNumber: '727',
    state: 'Kansas',
  }, {
    address: '18103 W 106th St #100, Olathe, KS 66061',
    city: 'Olathe',
    county: 'Johnson County',
    postcode: '66061',
    street: '106th St #100',
    streetNumber: '18103 W',
    state: 'Kansas',
  }, {
    address: '719 S Kansas Ave Suite 100, Topeka, KS 66603',
    city: 'Topeka',
    county: 'Shawnee County',
    postcode: '66603',
    street: 'Kansas Ave Suite 100',
    streetNumber: '719 S',
    state: 'Kansas',
  }],
  'Wisconsin': [{
    address: '756 N Milwaukee St, Milwaukee, WI 53202',
    city: 'Milwaukee',
    county: 'Milwaukee County',
    postcode: '53202',
    street: 'Milwaukee St',
    streetNumber: '756 N',
    state: 'Wisconsin',
  }, {
    address: '1 S Pinckney St, Madison, WI 53703',
    city: 'Madison',
    county: 'Dane County',
    postcode: '53703',
    street: 'Pinckney St',
    streetNumber: '1 S',
    state: 'Wisconsin',
  }, {
    address: '300 N Broadway, Green Bay, WI 54303',
    city: 'Green Bay',
    county: 'Brown County',
    postcode: '54303',
    street: 'Broadway',
    streetNumber: '300 N',
    state: 'Wisconsin',
  }],
  'Nebraska': [{
    address: '808 Conagra Dr, Omaha, NE 68102',
    city: 'Omaha',
    county: 'Douglas County',
    postcode: '68102',
    street: 'Conagra Dr',
    streetNumber: '808',
    state: 'Nebraska',
  }, {
    address: '1320 Lincoln Mall, Lincoln, NE 68508',
    city: 'Lincoln',
    county: 'Lancaster County',
    postcode: '68508',
    street: 'Lincoln Mall',
    streetNumber: '1320',
    state: 'Nebraska',
  }, {
    address: '923 Galvin Rd S, Bellevue, NE 68005',
    city: 'Bellevue',
    county: 'Sarpy County',
    postcode: '68005',
    street: 'Galvin Rd S',
    streetNumber: '923',
    state: 'Nebraska',
  }],
  'Maryland': [{
    address: '240 W Dickman St, Baltimore, MD 21230',
    city: 'Baltimore',
    state: 'Maryland',
    postcode: '21230',
    street: 'Dickman St',
    streetNumber: '240 W',
  }, {
    address: '118 N Market St, Frederick, MD 21701',
    city: 'Frederick',
    county: 'Frederick County',
    postcode: '21701',
    street: 'Market St',
    streetNumber: '118 N',
    state: 'Maryland',
  }, {
    address: '1 Research Ct, Rockville, MD 20850',
    city: 'Rockville',
    county: 'Montgomery County',
    postcode: '20850',
    street: 'Research Ct',
    streetNumber: '1',
    state: 'Maryland',
  }],
  'Massachusetts': [{
    address: '265 Franklin St #1700, Boston, MA 0211',
    city: 'Boston',
    county: 'Suffolk County',
    postcode: '0211',
    street: 'Franklin St #1700',
    streetNumber: '265',
    state: 'Massachusetts',
    unit: '1700',
  }, {
    address: '311 Main St #200, Worcester, MA 01608',
    city: 'Worcester',
    county: 'Worcester County',
    postcode: '01608',
    street: 'Main St #200',
    streetNumber: '311',
    state: 'Massachusetts',
    unit: '200',
  }, {
    address: '1441 Main St, Springfield, MA 01103',
    city: 'Springfield',
    county: 'Hampden County',
    postcode: '01103',
    street: 'Main St',
    streetNumber: '1441',
    state: 'Massachusetts',
  }],
  'Maine': [{
    address: '443 Congress St, Portland, ME 04101',
    city: 'Portland',
    county: 'Cumberland County',
    postcode: '04101',
    street: 'Congress St',
    streetNumber: '443',
    state: 'Maine',
  }, {
    address: '415 Lisbon St, Lewiston, ME 04240',
    city: 'Lewiston',
    county: 'Androscoggin County',
    postcode: '04240',
    street: 'Lisbon St',
    streetNumber: '415',
    state: 'Maine',
  }, {
    address: '2 Hammond St, Bangor, ME 04401',
    city: 'Bangor',
    county: 'Penobscot County',
    postcode: '04401',
    street: 'Hammond St',
    streetNumber: '2',
    state: 'Maine',
  }],
  'Minnesota': [{
    address: '81 S 9th St Suite 200, Minneapolis, MN 55402',
    city: 'Minneapolis',
    county: 'Hennepin County',
    postcode: '55402',
    street: '9th St Suite 200',
    streetNumber: '81 S',
    state: 'Minnesota',
  }, {
    address: '401 Robert St N #150, St Paul, MN 55101',
    city: 'Saint Paul',
    county: 'Ramsey County',
    postcode: '55101',
    street: 'Robert St N',
    streetNumber: '401',
    state: 'Minnesota',
    unit: '150',
  }, {
    address: '220 S Broadway STE 100, Rochester, MN 55904',
    city: 'Rochester',
    county: 'Olmsted County',
    postcode: '55904',
    street: 'Broadway STE 100',
    streetNumber: '220 S',
    state: 'Minnesota',
  }],
  'Nevada': [{
    address: '575 W Symphony Park Ave, Las Vegas, NV 89106',
    city: 'Las Vegas',
    county: 'Clark County',
    postcode: '89106',
    street: 'Symphony Park Ave',
    streetNumber: '575 W',
    state: 'Nevada',
  }, {
    address: '400 N Green Valley Pkwy, Henderson, NV 89074',
    city: 'Henderson',
    county: 'Clark County',
    postcode: '89074',
    street: 'Green Valley Pkwy',
    streetNumber: '400 N',
    state: 'Nevada',
  }, {
    address: '449 S Virginia St, Reno, NV 89501',
    city: 'Reno',
    county: 'Washoe County',
    postcode: '89501',
    street: 'Virginia St',
    streetNumber: '449 S',
    state: 'Nevada',
  }, {
    address: '1900 S Carson St, Carson City, NV 89701',
    city: 'Carson City',
    state: 'Nevada',
    postcode: '89701',
    street: 'Carson St',
    streetNumber: '1900 S',
  }],
  'New Hampshire': [{
    address: '54 Hanover St, Manchester, NH 03101',
    city: 'Manchester',
    county: 'Hillsborough County',
    postcode: '03101',
    street: 'Hanover St',
    streetNumber: '54',
    state: 'New Hampshire',
  }, {
    address: '29 W Broadway, Derry, NH 03038',
    city: 'Derry',
    county: 'Rockingham County',
    postcode: '03038',
    street: 'Broadway',
    streetNumber: '29 W',
    state: 'New Hampshire',
  }, {
    address: '49 S Main St Suite 104, Concord, NH 03301',
    city: 'Concord',
    county: 'Merrimack County',
    postcode: '03301',
    street: 'Main St Suite 104',
    streetNumber: '49 S',
    state: 'New Hampshire',
  }],
  'New York': [{
    address: '335 Adams St #2700, Brooklyn, NY 11201',
    city: 'Brooklyn',
    county: 'Kings County',
    postcode: '11201',
    street: 'Adams St #2700',
    streetNumber: '335',
    state: 'New York',
    unit: '2700',
  }, {
    address: '257 W Genesee St #600, Buffalo, NY 14202',
    city: 'Buffalo',
    county: 'Erie County',
    postcode: '14202',
    street: 'Genesee St #600',
    streetNumber: '257 W',
    state: 'New York',
    unit: '600',
  }, {
    address: '5 Computer Dr S, Albany, NY 12205',
    city: 'Albany',
    county: 'Albany County',
    postcode: '12205',
    street: 'Computer Dr S',
    streetNumber: '5',
    state: 'New York',
  }],
  'North Carolina': [{
    address: '615 S College St, Charlotte, NC 28202',
    city: 'Charlotte',
    county: 'Mecklenburg County',
    postcode: '28202',
    street: 'College St',
    streetNumber: '615 S',
    state: 'North Carolina',
  }, {
    address: '800 S Salisbury St, Raleigh, NC 27602',
    city: 'Raleigh',
    county: 'Wake County',
    postcode: '27602',
    street: 'Salisbury St',
    streetNumber: '800 S',
    state: 'North Carolina',
  }, {
    address: '111 W February 1 Pl, Greensboro, NC 27401',
    city: 'Greensboro',
    county: 'Guilford County',
    postcode: '27401',
    street: 'February 1 Pl',
    streetNumber: '111 W',
    state: 'North Carolina',
  }],
  'Oklahoma': [
    {
      address: '330 NE 10th St, Oklahoma City, OK 73104',
      city: 'Oklahoma City',
      county: 'Oklahoma County',
      postcode: '73104',
      street: 'NE 10th St',
      streetNumber: '330',
      state: 'Oklahoma'
    },
    {
      address: '1 W 3rd St, Tulsa, OK 74103',
      city: 'Tulsa',
      county: 'Tulsa County',
      postcode: '74103',
      street: '3rd St',
      streetNumber: '1 W',
      state: 'Oklahoma'
    },
    {
      address: '115 E Gray St, Norman, OK 73069',
      city: 'Norman',
      county: 'Cleveland County',
      postcode: '73069',
      street: 'Gray St',
      streetNumber: '115 E',
      state: 'Oklahoma'
    }
  ],
  'Virginia': [{
    address: '2100 Parks Avenue Virginia Beach, VA 23451',
    city: 'Virginia Beach',
    county: undefined,
    postcode: '23451',
    street: 'Parks Avenue',
    streetNumber: '2100',
    state: 'Virginia',
  }, {
    address: '500 E Main St #700, Norfolk, VA 23510',
    city: 'Norfolk',
    county: undefined,
    postcode: '23510',
    street: 'Main St #700',
    streetNumber: '500 E',
    state: 'Virginia',
    unit: '700',
  }, {
    // For some reason above two don't have county associated in geocoding API
    // (manually tested).  3rd largest city chamber of commerce also doesn't have
    // county (Richmond), so I use Tyson's Corner mall.
    address: '1961 Chain Bridge Rd, Tysons, VA 22102',
    city: 'McLean',
    county: 'Fairfax County',
    postcode: '22102',
    street: 'Chain Bridge Rd',
    streetNumber: '1961',
    state: 'Virginia',
  }],
  'Wyoming': [{
    address: '121 W 15th St #204, Cheyenne, WY 82001',
    city: 'Cheyenne',
    county: 'Laramie County',
    postcode: '82001',
    street: '15th St #204',
    streetNumber: '121 W',
    state: 'Wyoming',
    unit: '204',
  }, {
    address: '500 N Center St, Casper, WY 82601',
    city: 'Casper',
    county: 'Natrona County',
    postcode: '82601',
    street: 'Center St',
    streetNumber: '500 N',
    state: 'Wyoming',
  }, {
    address: '800 S 3rd St, Laramie, WY 82070',
    city: 'Laramie',
    county: 'Albany County',
    postcode: '82070',
    street: '3rd St',
    streetNumber: '800 S',
    state: 'Wyoming',
  }],
}
