import { ImplementedState } from "./stateInfo"
import { State } from './states'

export interface AddressData<S = ImplementedState> {
  streetAddress: string
  apt?: string
  city: string
  state: S
  county?: string
  zip: string
}

export const toAddressStr = (addrData: AddressData<State>) => {
  const {
    streetAddress,
    apt,
    city,
    state,
    zip,
  } = addrData
  if (apt) return `${streetAddress}, ${city} Unit ${apt}, ${state} ${zip}`
  return `${streetAddress}, ${city}, ${state} ${zip}`
}

// The Chamber of Commerce for the 3 largest cities in the state
// and others addresses as necessary
export const sampleAddresses: Record<ImplementedState, AddressData[]> = {
  'Arizona': [{
    streetAddress: '201 N Central Ave',
    city: 'Phoenix',
    county: 'Maricopa County',
    state: 'Arizona',
    zip: '85004',
  }, {
    streetAddress: '212 E Broadway Blvd',
    city: 'Tucson',
    county: 'Pima County',
    state: 'Arizona',
    zip: '85701',
  }, {
    streetAddress: '165 N Centennial Way',
    city: 'Mesa',
    county: 'Maricopa County',
    state: 'Arizona',
    zip: '85201',
  }],
  'Florida': [{
    streetAddress: '100 S Biscayne Blvd',
    city: 'Miami',
    county: 'Miami-Dade County',
    state: 'Florida',
    zip: '33131',
  }, {
    streetAddress: '5443 Main St',
    city: 'Port Richey',
    county: 'Pasco County',
    state: 'Florida',
    zip: '34652',
  }, {
    streetAddress: '2000 W Commercial Blvd',
    city: 'Fort Lauderdale',
    county: 'Broward County',
    state: 'Florida',
    zip: '33309',
  }],
  'Michigan': [{
    streetAddress: '45525 Hanford Rd',
    city: 'Canton',
    county: 'Wayne County',
    state: 'Michigan',
    zip: '48187',
  }, {
    streetAddress: '24624 W Warren St',
    city: 'Dearborn Heights',
    county: 'Wayne County',
    state: 'Michigan',
    zip: '48127',
  }, {
    streetAddress: '22100 Michigan Ave. Dearborn',
    city: 'Dearborn',
    county: 'Wayne County',
    state: 'Michigan',
    zip: '48124',
  }, {
    streetAddress: '700 Broad Street St Joseph',
    city: 'St. Joseph',
    county: 'Berrien County',
    state: 'Michigan',
    zip: '49085',
  }, {
    streetAddress: '2724 Peck St',
    city: 'Muskegon Heights',
    county: 'Muskegon County',
    state: 'Michigan',
    zip: '49444',
  }],
  'Georgia': [{
    streetAddress: '191 Peachtree St NE',
    city: 'Atlanta',
    county: 'Fulton County',
    state: 'Georgia',
    zip: '30303',
  }, {
    streetAddress: '1 10th St',
    city: 'Augusta',
    county: 'Richmond County',
    state: 'Georgia',
    zip: '30901',
  }, {
    streetAddress: '1200 6th Ave',
    city: 'Columbus',
    county: 'Muscogee County',
    state: 'Georgia',
    zip: '31902',
  }, {
    streetAddress: '305 Coliseum Dr',
    city: 'Macon',
    county: 'Bibb County',
    state: 'Georgia',
    zip: '31217',
  }],
  'Wisconsin': [{
    streetAddress: '756 N Milwaukee St',
    city: 'Milwaukee',
    county: 'Milwaukee County',
    state: 'Wisconsin',
    zip: '53202',
  }, {
    streetAddress: '1 S Pinckney St',
    city: 'Madison',
    county: 'Dane County',
    state: 'Wisconsin',
    zip: '53703',
  }, {
    streetAddress: '300 N Broadway',
    city: 'Green Bay',
    county: 'Brown County',
    state: 'Wisconsin',
    zip: '54303',
  }],
  'Nebraska': [{
    streetAddress: '808 Conagra Dr',
    city: 'Omaha',
    county: 'Douglas County',
    state: 'Nebraska',
    zip: '68102',
  }, {
    streetAddress: '1320 Lincoln Mall',
    city: 'Lincoln',
    county: 'Lancaster County',
    state: 'Nebraska',
    zip: '68508',
  }, {
    streetAddress: '923 Galvin Rd S',
    city: 'Bellevue',
    county: 'Sarpy County',
    state: 'Nebraska',
    zip: '68005',
  }],
  'Maryland': [{
    streetAddress: '240 W Dickman St',
    city: 'Baltimore',
    state: 'Maryland',
    zip: '21230',
  }, {
    streetAddress: '118 N Market St',
    city: 'Frederick',
    county: 'Frederick County',
    state: 'Maryland',
    zip: '21701',
  }, {
    streetAddress: '1 Research Ct',
    city: 'Rockville',
    county: 'Montgomery County',
    state: 'Maryland',
    zip: '20850',
  }],
  'Massachusetts': [{
    streetAddress: '265 Franklin St #1700',
    city: 'Boston',
    county: 'Suffolk County',
    state: 'Massachusetts',
    zip: '02110',
  }, {
    streetAddress: '311 Main St #200',
    city: 'Worcester',
    county: 'Worcester County',
    state: 'Massachusetts',
    zip: '01608',
  }, {
    streetAddress: '1441 Main St',
    city: 'Springfield',
    county: 'Hampden County',
    state: 'Massachusetts',
    zip: '01103',
  }],
  'Maine': [{
    streetAddress: '443 Congress St',
    city: 'Portland',
    county: 'Cumberland County',
    state: 'Maine',
    zip: '04101',
  }, {
    streetAddress: '415 Lisbon St',
    city: 'Lewiston',
    county: 'Androscoggin County',
    state: 'Maine',
    zip: '04240',
  }, {
    streetAddress: '2 Hammond St',
    city: 'Bangor',
    county: 'Penobscot County',
    state: 'Maine',
    zip: '04401',
  }],
  'Minnesota': [{
    streetAddress: '81 S 9th St Suite 200',
    city: 'Minneapolis',
    county: 'Hennepin County',
    state: 'Minnesota',
    zip: '55402',
  }, {
    streetAddress: '401 Robert St N #150',
    city: 'Saint Paul',
    county: 'Ramsey County',
    state: 'Minnesota',
    zip: '55101',
  }, {
    streetAddress: '220 S Broadway STE 100',
    city: 'Rochester',
    county: 'Olmsted County',
    state: 'Minnesota',
    zip: '55904',
  }],
  'Nevada': [{
    streetAddress: '575 W Symphony Park Ave',
    city: 'Las Vegas',
    county: 'Clark County',
    state: 'Nevada',
    zip: '89106',
  }, {
    streetAddress: '400 N Green Valley Pkwy',
    city: 'Henderson',
    county: 'Clark County',
    state: 'Nevada',
    zip: '89074',
  }, {
    streetAddress: '449 S Virginia St',
    city: 'Reno',
    county: 'Washoe County',
    state: 'Nevada',
    zip: '89501',
  }, {
    streetAddress: '1900 S Carson St',
    city: 'Carson City',
    state: 'Nevada',
    zip: '89701',
  }],
  'New Hampshire': [{
    streetAddress: '54 Hanover St',
    city: 'Manchester',
    county: 'Hillsborough County',
    state: 'New Hampshire',
    zip: '03101',
  }, {
    streetAddress: '29 W Broadway',
    city: 'Derry',
    county: 'Rockingham County',
    state: 'New Hampshire',
    zip: '03038',
  }, {
    streetAddress: '49 S Main St Suite 104',
    city: 'Concord',
    county: 'Merrimack County',
    state: 'New Hampshire',
    zip: '03301',
  }],
  'New York': [{
    streetAddress: '335 Adams St #2700',
    city: 'Brooklyn',
    county: 'Kings County',
    state: 'New York',
    zip: '11201',
  }, {
    streetAddress: '257 W Genesee St #600',
    city: 'Buffalo',
    county: 'Erie County',
    state: 'New York',
    zip: '14202',
  }, {
    streetAddress: '5 Computer Dr S',
    city: 'Albany',
    county: 'Albany County',
    state: 'New York',
    zip: '12205',
  }],
  'North Carolina': [{
    streetAddress: '615 S College St',
    city: 'Charlotte',
    county: 'Mecklenburg County',
    state: 'North Carolina',
    zip: '28202',
  }, {
    streetAddress: '800 S Salisbury St',
    city: 'Raleigh',
    county: 'Wake County',
    state: 'North Carolina',
    zip: '27602',
  }, {
    streetAddress: '111 W February 1 Pl',
    city: 'Greensboro',
    county: 'Guilford County',
    state: 'North Carolina',
    zip: '27401',
  }],
  'Oklahoma': [
    {
      streetAddress: '330 NE 10th St',
      city: 'Oklahoma City',
      county: 'Oklahoma County',
      state: 'Oklahoma',
      zip: '73104',
    },
    {
      streetAddress: '1 W 3rd St',
      city: 'Tulsa',
      county: 'Tulsa County',
      state: 'Oklahoma',
      zip: '74103',
    },
    {
      streetAddress: '115 E Gray St',
      city: 'Norman',
      county: 'Cleveland County',
      state: 'Oklahoma',
      zip: '73069',
    }
  ],
  'Virginia': [{
    streetAddress: '2100 Parks Avenue',
    city: 'Virginia Beach',
    county: undefined,
    state: 'Virginia',
    zip: '23451'
  }, {
    streetAddress: '500 E Main St #700',
    city: 'Norfolk',
    county: undefined,
    state: 'Virginia',
    zip: '23510'
  }, {
    // For some reason above two don't have county associated in geocoding API
    // (manually tested).  3rd largest city chamber of commerce also doesn't have
    // county (Richmond), so I use Tyson's Corner mall.
    streetAddress: '1961 Chain Bridge Rd',
    city: 'McLean',
    county: 'Fairfax County',
    state: 'Virginia',
    zip: '22102'
  }],
  'Wyoming': [{
    streetAddress: '121 W 15th St #204',
    city: 'Cheyenne',
    county: 'Laramie County',
    state: 'Wyoming',
    zip: '82001',
  }, {
    streetAddress: '500 N Center St',
    city: 'Casper',
    county: 'Natrona County',
    state: 'Wyoming',
    zip: '82601',
  }, {
    streetAddress: '800 S 3rd St',
    city: 'Laramie',
    county: 'Albany County',
    state: 'Wyoming',
    zip: '82070',
  }],
}
