import { Locale } from "./locale"
import { ImplementedState } from "./stateInfo"

export interface AddressData extends Locale<ImplementedState> {
  address: string
  postcode: string
  street: string
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
    street: '201 N Central Ave',
    state: 'Arizona',
  }, {
    address: '212 E Broadway Blvd, Tucson, AZ 85701',
    city: 'Tucson',
    county: 'Pima County',
    postcode: '85701',
    street: '212 E Broadway Blvd',
    state: 'Arizona',
  }, {
    address: '165 N Centennial Way, Mesa, AZ 85201',
    city: 'Mesa',
    county: 'Maricopa County',
    postcode: '85201',
    street: '165 N Centennial Way',
    state: 'Arizona',
  }],
  'Florida': [{
    address: '100 S Biscayne Blvd, Miami, FL 33131',
    city: 'Miami',
    county: 'Miami-Dade County',
    postcode: '33131',
    street: '100 S Biscayne Blvd',
    state: 'Florida',
  }, {
    address: '5443 Main St, Port Richey, FL 34652',
    city: 'Port Richey',
    county: 'Pasco County',
    postcode: '34652',
    street: '5443 Main St',
    state: 'Florida',
  }, {
    address: '2000 W Commercial Blvd, Fort Lauderdale, FL 33309',
    city: 'Fort Lauderdale',
    county: 'Broward County',
    postcode: '33309',
    street: '2000 W Commercial Blvd',
    state: 'Florida',
  }],
  'Michigan': [{
    address: '45525 Hanford Rd, Canton, MI 48187',
    city: 'Canton',
    county: 'Wayne County',
    postcode: '48187',
    street: '45525 Hanford Rd',
    state: 'Michigan',
  }, {
    address: '24624 W Warren St, Dearborn Heights 48127, MI',
    city: 'Dearborn Heights',
    county: 'Wayne County',
    postcode: '48127',
    street: '24624 W Warren St',
    state: 'Michigan',
  }, {
    address: '22100 Michigan Ave. Dearborn, MI 48124',
    city: 'Dearborn',
    county: 'Wayne County',
    postcode: '48124',
    street: '22100 Michigan Ave.',
    state: 'Michigan',
  }, {
    address: '700 Broad Street St Joseph, MI 49085',
    city: 'St. Joseph',
    county: 'Berrien County',
    postcode: '49085',
    street: '700 Broad Street',
    state: 'Michigan',
  }, {
    address: '2724 Peck St, MI 49444',
    city: 'Muskegon Heights',
    county: 'Muskegon County',
    postcode: '49444',
    street: '2724 Peck St',
    state: 'Michigan',
  }],
  'Georgia': [{
    address: '191 Peachtree St NE, Atlanta, GA 30303',
    city: 'Atlanta',
    county: 'Fulton County',
    postcode: '30303',
    street: '191 Peachtree St',
    state: 'Georgia',
  }, {
    address: '1 10th St, Augusta, GA 30901',
    city: 'Augusta',
    county: 'Richmond County',
    postcode: '30901',
    street: '1 10th St',
    state: 'Georgia',
  }, {
    address: '1200 6th Ave, Columbus, GA 31902',
    city: 'Columbus',
    county: 'Muscogee County',
    postcode: '31902',
    street: '1200 6th Ave',
    state: 'Georgia',
  }, {
    address: '305 Coliseum Dr, Macon, GA 31217',
    city: 'Macon',
    county: 'Bibb County',
    postcode: '31217',
    street: '305 Coliseum Dr',
    state: 'Georgia',
  }],
  'Kansas': [{
    address: '727 Minnesota Ave, Kansas City, KS 66101',
    city: 'Kansas City',
    county: 'Wyandotte County',
    postcode: '66101',
    street: '727 Minnesota Ave',
    state: 'Kansas',
  }, {
    address: '18103 W 106th St #100, Olathe, KS 66061',
    city: 'Olathe',
    county: 'Johnson County',
    postcode: '66061',
    street: '18103 W 106th St #100',
    state: 'Kansas',
  }, {
    address: '719 S Kansas Ave Suite 100, Topeka, KS 66603',
    city: 'Topeka',
    county: 'Shawnee County',
    postcode: '66603',
    street: '719 S Kansas Ave Suite 100',
    state: 'Kansas',
  }],
  'Wisconsin': [{
    address: '756 N Milwaukee St, Milwaukee, WI 53202',
    city: 'Milwaukee',
    county: 'Milwaukee County',
    postcode: '53202',
    street: '756 N Milwaukee St',
    state: 'Wisconsin',
  }, {
    address: '1 S Pinckney St, Madison, WI 53703',
    city: 'Madison',
    county: 'Dane County',
    postcode: '53703',
    street: '1 S Pinckney St',
    state: 'Wisconsin',
  }, {
    address: '300 N Broadway, Green Bay, WI 54303',
    city: 'Green Bay',
    county: 'Brown County',
    postcode: '54303',
    street: '300 N Broadway',
    state: 'Wisconsin',
  }],
  'Nebraska': [{
    address: '808 Conagra Dr, Omaha, NE 68102',
    city: 'Omaha',
    county: 'Douglas County',
    postcode: '68102',
    street: '808 Conagra Dr',
    state: 'Nebraska',
  }, {
    address: '1320 Lincoln Mall, Lincoln, NE 68508',
    city: 'Lincoln',
    county: 'Lancaster County',
    postcode: '68508',
    street: '1320 Lincoln Mall',
    state: 'Nebraska',
  }, {
    address: '923 Galvin Rd S, Bellevue, NE 68005',
    city: 'Bellevue',
    county: 'Sarpy County',
    postcode: '68005',
    street: '923 Galvin Rd S',
    state: 'Nebraska',
  }],
  'Maryland': [{
    address: '240 W Dickman St, Baltimore, MD 21230',
    city: 'Baltimore',
    state: 'Maryland',
    postcode: '21230',
    street: '240 W Dickman St',
  }, {
    address: '118 N Market St, Frederick, MD 21701',
    city: 'Frederick',
    county: 'Frederick County',
    postcode: '21701',
    street: '118 N Market St',
    state: 'Maryland',
  }, {
    address: '1 Research Ct, Rockville, MD 20850',
    city: 'Rockville',
    county: 'Montgomery County',
    postcode: '20850',
    street: '1 Research Ct',
    state: 'Maryland',
  }],
  'Massachusetts': [{
    address: '265 Franklin St #1700, Boston, MA 0211',
    city: 'Boston',
    county: 'Suffolk County',
    postcode: '0211',
    street: '265 Franklin St #1700',
    state: 'Massachusetts',
    unit: '1700',
  }, {
    address: '311 Main St #200, Worcester, MA 01608',
    city: 'Worcester',
    county: 'Worcester County',
    postcode: '01608',
    street: '311 Main St #200',
    state: 'Massachusetts',
    unit: '200',
  }, {
    address: '1441 Main St, Springfield, MA 01103',
    city: 'Springfield',
    county: 'Hampden County',
    postcode: '01103',
    street: '1441 Main St',
    state: 'Massachusetts',
  }],
  'Maine': [{
    address: '443 Congress St, Portland, ME 04101',
    city: 'Portland',
    county: 'Cumberland County',
    postcode: '04101',
    street: '443 Congress St',
    state: 'Maine',
  }, {
    address: '415 Lisbon St, Lewiston, ME 04240',
    city: 'Lewiston',
    county: 'Androscoggin County',
    postcode: '04240',
    street: '415 Lisbon St',
    state: 'Maine',
  }, {
    address: '2 Hammond St, Bangor, ME 04401',
    city: 'Bangor',
    county: 'Penobscot County',
    postcode: '04401',
    street: '2 Hammond St',
    state: 'Maine',
  }],
  'Minnesota': [{
    address: '81 S 9th St Suite 200, Minneapolis, MN 55402',
    city: 'Minneapolis',
    county: 'Hennepin County',
    postcode: '55402',
    street: '81 S 9th St Suite 200',
    state: 'Minnesota',
  }, {
    address: '401 Robert St N #150, St Paul, MN 55101',
    city: 'Saint Paul',
    county: 'Ramsey County',
    postcode: '55101',
    street: '401 Robert St N',
    state: 'Minnesota',
    unit: '150',
  }, {
    address: '220 S Broadway STE 100, Rochester, MN 55904',
    city: 'Rochester',
    county: 'Olmsted County',
    postcode: '55904',
    street: '220 S Broadway STE 100',
    state: 'Minnesota',
  }],
  'Nevada': [{
    address: '575 W Symphony Park Ave, Las Vegas, NV 89106',
    city: 'Las Vegas',
    county: 'Clark County',
    postcode: '89106',
    street: '575 W Symphony Park Ave',
    state: 'Nevada',
  }, {
    address: '400 N Green Valley Pkwy, Henderson, NV 89074',
    city: 'Henderson',
    county: 'Clark County',
    postcode: '89074',
    street: '400 N Green Valley Pkwy',
    state: 'Nevada',
  }, {
    address: '449 S Virginia St, Reno, NV 89501',
    city: 'Reno',
    county: 'Washoe County',
    postcode: '89501',
    street: '449 S Virginia St',
    state: 'Nevada',
  }, {
    address: '1900 S Carson St, Carson City, NV 89701',
    city: 'Carson City',
    state: 'Nevada',
    postcode: '89701',
    street: '1900 S Carson St',
  }],
  'New Hampshire': [{
    address: '54 Hanover St, Manchester, NH 03101',
    city: 'Manchester',
    county: 'Hillsborough County',
    postcode: '03101',
    street: '54 Hanover St',
    state: 'New Hampshire',
  }, {
    address: '29 W Broadway, Derry, NH 03038',
    city: 'Derry',
    county: 'Rockingham County',
    postcode: '03038',
    street: '29 W Broadway',
    state: 'New Hampshire',
  }, {
    address: '49 S Main St Suite 104, Concord, NH 03301',
    city: 'Concord',
    county: 'Merrimack County',
    postcode: '03301',
    street: '49 S Main St Suite 104',
    state: 'New Hampshire',
  }],
  'New York': [{
    address: '335 Adams St #2700, Brooklyn, NY 11201',
    city: 'Brooklyn',
    county: 'Kings County',
    postcode: '11201',
    street: '335 Adams St #2700',
    state: 'New York',
    unit: '2700',
  }, {
    address: '257 W Genesee St #600, Buffalo, NY 14202',
    city: 'Buffalo',
    county: 'Erie County',
    postcode: '14202',
    street: '257 W Genesee St #600',
    state: 'New York',
    unit: '600',
  }, {
    address: '5 Computer Dr S, Albany, NY 12205',
    city: 'Albany',
    county: 'Albany County',
    postcode: '12205',
    street: '5 Computer Dr S',
    state: 'New York',
  }],
  'North Carolina': [{
    address: '615 S College St, Charlotte, NC 28202',
    city: 'Charlotte',
    county: 'Mecklenburg County',
    postcode: '28202',
    street: '615 S College St',
    state: 'North Carolina',
  }, {
    address: '800 S Salisbury St, Raleigh, NC 27602',
    city: 'Raleigh',
    county: 'Wake County',
    postcode: '27602',
    street: '800 S Salisbury St',
    state: 'North Carolina',
  }, {
    address: '111 W February 1 Pl, Greensboro, NC 27401',
    city: 'Greensboro',
    county: 'Guilford County',
    postcode: '27401',
    street: '111 W February 1 Pl',
    state: 'North Carolina',
  }],
  'Oklahoma': [
    {
      address: '330 NE 10th St, Oklahoma City, OK 73104',
      city: 'Oklahoma City',
      county: 'Oklahoma County',
      postcode: '73104',
      street: '330 NE 10th St',
      state: 'Oklahoma'
    },
    {
      address: '1 W 3rd St, Tulsa, OK 74103',
      city: 'Tulsa',
      county: 'Tulsa County',
      postcode: '74103',
      street: '1 W 3rd St',
      state: 'Oklahoma'
    },
    {
      address: '115 E Gray St, Norman, OK 73069',
      city: 'Norman',
      county: 'Cleveland County',
      postcode: '73069',
      street: '115 E Gray St',
      state: 'Oklahoma'
    }
  ],
  'Virginia': [{
    address: '2100 Parks Avenue Virginia Beach, VA 23451',
    city: 'Virginia Beach',
    county: undefined,
    postcode: '23451',
    street: '2100 Parks Avenue',
    state: 'Virginia',
  }, {
    address: '500 E Main St #700, Norfolk, VA 23510',
    city: 'Norfolk',
    county: undefined,
    postcode: '23510',
    street: '500 E Main St #700',
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
    street: '1961 Chain Bridge Rd',
    state: 'Virginia',
  }],
  'West Virginia': [{
    address: '1624 Kanawha Blvd E #2115, Charleston, WV 25311',
    city: 'Charleston',
    county: 'Kanawha County',
    postcode: '25311',
    street: '1624 Kanawha Blvd',
    state: 'West Virginia',
    unit: '2115',
  }, {
    address: '198 Viking Way, Martinsburg, WV 25401',
    city: 'Martinsburg',
    county: 'Berkeley County',
    postcode: '25401',
    street: '198 Viking Way',
    state: 'West Virginia',
  }, {
    address: '1108 3rd Ave #300, Huntington, WV 25701',
    city: 'Huntington',
    county: 'Cabell County',
    postcode: '25701',
    street: '1108 3rd Ave',
    state: 'West Virginia',
    unit: '300',
  }],
  'Wyoming': [{
    address: '121 W 15th St #204, Cheyenne, WY 82001',
    city: 'Cheyenne',
    county: 'Laramie County',
    postcode: '82001',
    street: '121 W 15th St #204',
    state: 'Wyoming',
    unit: '204',
  }, {
    address: '500 N Center St, Casper, WY 82601',
    city: 'Casper',
    county: 'Natrona County',
    postcode: '82601',
    street: '500 N Center St',
    state: 'Wyoming',
  }, {
    address: '800 S 3rd St, Laramie, WY 82070',
    city: 'Laramie',
    county: 'Albany County',
    postcode: '82070',
    street: '800 S 3rd St',
    state: 'Wyoming',
  }],
}
