import { State } from './states'

type StatePortal = Record<State, string | null>

const statePortal: StatePortal = {
  'Alabama': 'https://www.alabamainteractive.org/sos/voter_registration/voterRegistrationWelcome.action',
  'Alaska': 'https://voterregistration.alaska.gov/',
  'Arizona': 'https://servicearizona.com/VoterRegistration/selectLanguage',
  'Arkansas': 'https://www.sos.arkansas.gov/elections/voter-information/voter-registration-information/request-for-a-voter-registration-application',
  'California': 'https://registertovote.ca.gov/',
  'Colorado': 'https://www.sos.state.co.us/voter/pages/pub/olvr/verifyNewVoter.xhtml',
  'Connecticut': 'https://voterregistration.ct.gov/OLVR/welcome.do',
  'Delaware': 'https://ivote.de.gov/VoterView',
  'District of Columbia': 'https://www.vote4dc.com/ApplyInstructions/Register',
  'Florida': 'https://registertovoteflorida.gov/home',
  'Georgia': 'https://registertovote.sos.ga.gov/GAOLVR/welcome.do#no-back-button',
  'Hawaii': 'https://olvr.hawaii.gov/register.aspx',
  'Idaho': 'https://idahovotes.gov/#',
  'Illinois': 'https://ova.elections.il.gov/',
  'Indiana': 'https://indianavoters.in.gov/',
  'Iowa': 'https://mymvd.iowadot.gov/Account/Login?ReturnUrl=%2fVoterRegistration',
  'Kansas': 'https://www.kdor.ks.gov/Apps/VoterReg/Default.aspx',
  'Kentucky': 'https://vrsws.sos.ky.gov/ovrweb/',
  'Louisiana': 'https://www.sos.la.gov/ElectionsAndVoting/Pages/OnlineVoterRegistration.aspx',
  'Maine': null,
  'Maryland': 'https://voterservices.elections.maryland.gov/OnlineVoterRegistration/VoterType',
  'Massachusetts': 'https://www.sec.state.ma.us/OVR/Welcome.aspx',
  'Michigan': 'https://mvic.sos.state.mi.us/RegisterVoter',
  'Minnesota': 'https://mnvotes.sos.state.mn.us/VoterRegistration/VoterRegistrationMain.aspx',
  'Mississippi': null,
  'Missouri': 'https://www.sos.mo.gov/elections/goVoteMissouri/register.aspx',
  'Montana': null,
  'Nebraska': 'https://www.nebraska.gov/apps-sos-voter-registration/',
  'Nevada': 'https://www.registertovotenv.gov/',
  'New Hampshire': null,
  'New Jersey': 'https://vote.sos.ri.gov/Home/RegistertoVote?ActiveFlag=1',
  'New Mexico': 'https://portal.sos.state.nm.us/OVR/(S(od4445h5uj2f5tyucvvhszdf))/WebPages/InstructionsStep1.aspx?AspxAutoDetectCookieSupport=1',
  'New York': 'https://dmv.ny.gov/more-info/electronic-voter-registration-application',
  'North Carolina': 'https://www.ncdot.gov/dmv/offices-services/online/Pages/voter-registration-application.aspx',
  'North Dakota': null,
  'Ohio': 'https://olvr.ohiosos.gov/',
  'Oklahoma': 'https://www.ok.gov/elections/Voter_Info/Register_to_Vote/',
  'Oregon': 'https://secure.sos.state.or.us/orestar/vr/register.do?lang=eng&source=RTV',
  'Pennsylvania': 'https://www.pavoterservices.pa.gov/Pages/VoterRegistrationApplication.aspx',
  'Rhode Island': 'https://vote.sos.ri.gov/Home/RegistertoVote?ActiveFlag=1',
  'South Carolina': 'https://info.scvotes.sc.gov/eng/ovr/start.aspx',
  'South Dakota': null,
  'Tennessee': 'https://ovr.govote.tn.gov/',
  'Texas': null,
  'Utah': 'https://secure.utah.gov/voterreg/login.html?selection=REGISTER',
  'Vermont': 'https://olvr.vermont.gov/',
  'Virginia': 'https://vote.elections.virginia.gov/VoterInformation',
  'Washington': 'https://voter.votewa.gov/WhereToVote.aspx',
  'West Virginia': 'https://ovr.sos.wv.gov/Register/Landing#Qualifications',
  'Wisconsin': 'https://myvote.wi.gov/en-us/RegisterToVote',
  'Wyoming': null,
}


/**
 * Returns the link to the state registration portal, or null if the state
 * doesn't have one.
 */
export const getStatePortal = (state: State): string | null => {
  return statePortal[state] ? statePortal[state] : null
}
