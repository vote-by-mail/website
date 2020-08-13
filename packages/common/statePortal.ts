import { State } from './states'

interface StatePortal {
  regUrl: string
  infoUrl: string
}

const statePortal: Record<State, StatePortal | null> = {
  'Alabama': {
    regUrl: 'https://www.alabamainteractive.org/sos/voter_registration/voterRegistrationWelcome.action',
    infoUrl: 'https://www.sos.alabama.gov/alabama-votes/voter/absentee-voting',
  },
  'Alaska': {
    regUrl: 'https://voterregistration.alaska.gov/',
    infoUrl: 'http://www.elections.alaska.gov/Core/votingbymail.php',
  },
  'Arizona': {
    regUrl: 'https://servicearizona.com/VoterRegistration/selectLanguage',
    infoUrl: 'https://azsos.gov/votebymail',
  },
  'Arkansas': {
    regUrl: 'https://www.sos.arkansas.gov/elections/voter-information/voter-registration-information/request-for-a-voter-registration-application',
    infoUrl: 'https://www.sos.arkansas.gov/elections/voter-information/absentee-voting',
  },
  'California': {
    regUrl: 'https://registertovote.ca.gov/',
    infoUrl: 'https://www.sos.ca.gov/elections/voter-registration/vote-mail/#apply',
  },
  'Colorado': {
    regUrl: 'https://www.sos.state.co.us/voter/pages/pub/olvr/verifyNewVoter.xhtml',
    infoUrl: 'https://www.sos.state.co.us/pubs/elections/FAQs/mailBallotsFAQ.html',
  },
  'Connecticut': {
    regUrl: 'https://voterregistration.ct.gov/OLVR/welcome.do',
    infoUrl: 'https://portal.ct.gov/SOTS/Election-Services/Voter-Information/Absentee-Voting',
  },
  'Delaware': {
    regUrl: 'https://ivote.de.gov/VoterView',
    infoUrl: 'https://elections.delaware.gov/voter/absenteeballot.shtml',
  },
  'District of Columbia': {
    regUrl: 'https://www.vote4dc.com/ApplyInstructions/Register',
    infoUrl: 'https://www.dcboe.org/Voters/Absentee-Voting/Request-an-Absentee-Ballot',
  },
  'Florida': {
    regUrl: 'https://registertovoteflorida.gov/home',
    infoUrl: 'https://dos.myflorida.com/elections/for-voters/voting/vote-by-mail/',
  },
  'Georgia': {
    regUrl: 'https://registertovote.sos.ga.gov/GAOLVR/welcome.do#no-back-button',
    infoUrl: 'https://sos.ga.gov/admin/files/Absentee_Ballot_Application_2018.pdf',
  },
  'Hawaii': {
    regUrl: 'https://olvr.hawaii.gov/register.aspx',
    infoUrl: 'https://elections.hawaii.gov/voters/applications/',
  },
  'Idaho': {
    regUrl: 'https://idahovotes.gov/#',
    infoUrl: 'https://idahovotes.gov/absentee-voter-information/',
  },
  'Illinois': {
    regUrl: 'https://ova.elections.il.gov/',
    infoUrl: 'https://elections.il.gov/electionoperations/VotingByMail.aspx',
  },
  'Indiana': {
    regUrl: 'https://indianavoters.in.gov/',
    infoUrl: 'https://www.in.gov/sos/elections/2402.htm',
  },
  'Iowa': {
    regUrl: 'https://mymvd.iowadot.gov/Account/Login?ReturnUrl=%2fVoterRegistration',
    infoUrl: 'https://sos.iowa.gov/elections/electioninfo/absenteeinfo.html',
  },
  'Kansas': {
    regUrl: 'https://www.kdor.ks.gov/Apps/VoterReg/Default.aspx',
    infoUrl: 'https://sos.kansas.gov/elections/',
  },
  'Kentucky': {
    regUrl: 'https://vrsws.sos.ky.gov/ovrweb/',
    infoUrl: 'https://elect.ky.gov/Frequently-Asked-Questions/Pages/Absentee-Voting.aspx',
  },
  'Louisiana': {
    regUrl: 'https://www.sos.la.gov/ElectionsAndVoting/Pages/OnlineVoterRegistration.aspx',
    infoUrl: 'https://www.sos.la.gov/ElectionsAndVoting/Vote/VoteByMail/Pages/default.aspx',
  },
  'Maine': null,
  'Maryland': {
    regUrl: 'https://voterservices.elections.maryland.gov/OnlineVoterRegistration/VoterType',
    infoUrl: 'https://elections.maryland.gov/voting/absentee.html',
  },
  'Massachusetts': {
    regUrl: 'https://www.sec.state.ma.us/OVR/Welcome.aspx',
    infoUrl: 'https://www.sec.state.ma.us/ele/eleabsentee/absidx.htm',
  },
  'Michigan': {
    regUrl: 'https://mvic.sos.state.mi.us/RegisterVoter',
    infoUrl: 'https://www.michigan.gov/sos/0,4670,7-127-1633_8716_8728-21037--,00.html',
  },
  'Minnesota': {
    regUrl: 'https://mnvotes.sos.state.mn.us/VoterRegistration/VoterRegistrationMain.aspx',
    infoUrl: 'https://www.sos.state.mn.us/elections-voting/other-ways-to-vote/vote-early-by-mail/',
  },
  'Mississippi': null,
  'Missouri': {
    regUrl: 'https://www.sos.mo.gov/elections/goVoteMissouri/register.aspx',
    infoUrl: 'https://www.sos.mo.gov/elections/goVoteMissouri/howtovote',
  },
  'Montana': null,
  'Nebraska': {
    regUrl: 'https://www.nebraska.gov/apps-sos-voter-registration/',
    infoUrl: 'https://sos.nebraska.gov/elections/early-voting',
  },
  'Nevada': {
    regUrl: 'https://www.registertovotenv.gov/',
    infoUrl: 'https://www.nvsos.gov/sos/elections/voters/absentee-voting',
  },
  'New Hampshire': null,
  'New Jersey': {
    regUrl: 'https://vote.sos.ri.gov/Home/RegistertoVote?ActiveFlag=1',
    infoUrl: 'https://www.state.nj.us/state/elections/vote-by-mail.shtml',
  },
  'New Mexico': {
    regUrl: 'https://portal.sos.state.nm.us/OVR/(S(od4445h5uj2f5tyucvvhszdf))/WebPages/InstructionsStep1.aspx?AspxAutoDetectCookieSupport=1',
    infoUrl: 'https://www.sos.state.nm.us/voting-and-elections/voting-faqs/absentee-voting-by-mail/',
  },
  'New York': {
    regUrl: 'https://dmv.ny.gov/more-info/electronic-voter-registration-application',
    infoUrl: 'https://www.elections.ny.gov/votingabsentee.html',
  },
  'North Carolina': {
    regUrl: 'https://www.ncdot.gov/dmv/offices-services/online/Pages/voter-registration-application.aspx',
    infoUrl: 'https://www.ncsbe.gov/voting-options/absentee-voting',
  },
  'North Dakota': null,
  'Ohio': {
    regUrl: 'https://olvr.ohiosos.gov/',
    infoUrl: 'https://www.ohiosos.gov/elections/voters/absentee-voting/',
  },
  'Oklahoma': {
    regUrl: 'https://www.ok.gov/elections/Voter_Info/Register_to_Vote/',
    infoUrl: 'https://www.ok.gov/elections/Voter_Info/Absentee_Voting/',
  },
  'Oregon': {
    regUrl: 'https://secure.sos.state.or.us/orestar/vr/register.do?lang=eng&source=RTV',
    infoUrl: 'https://sos.oregon.gov/voting/pages/voteinor.aspx',
  },
  'Pennsylvania': {
    regUrl: 'https://www.pavoterservices.pa.gov/Pages/VoterRegistrationApplication.aspx',
    infoUrl: 'https://www.votespa.com/Voting-in-PA/Pages/Mail-and-Absentee-Ballot.aspx',
  },
  'Rhode Island': {
    regUrl: 'https://vote.sos.ri.gov/Home/RegistertoVote?ActiveFlag=1',
    infoUrl: 'https://elections.ri.gov/voting/applymail.php',
  },
  'South Carolina': {
    regUrl: 'https://info.scvotes.sc.gov/eng/ovr/start.aspx',
    infoUrl: 'https://scvotes.org/absentee-voting',
  },
  'South Dakota': null,
  'Tennessee': {
    regUrl: 'https://ovr.govote.tn.gov/',
    infoUrl: 'https://sos.tn.gov/products/elections/absentee-voting#3',
  },
  'Texas': null,
  'Utah': {
    regUrl: 'https://secure.utah.gov/voterreg/login.html?selection=REGISTER',
    infoUrl: 'https://elections.utah.gov/Media/Default/Documents/Voter_Forms/absentee%20form.pdf',
  },
  'Vermont': {
    regUrl: 'https://olvr.vermont.gov/',
    infoUrl: 'https://sos.vermont.gov/elections/voters/early-absentee-voting/',
  },
  'Virginia': {
    regUrl: 'https://vote.elections.virginia.gov/VoterInformation',
    infoUrl: 'https://www.elections.virginia.gov/casting-a-ballot/absentee-voting/',
  },
  'Washington': {
    regUrl: 'https://voter.votewa.gov/WhereToVote.aspx',
    infoUrl: 'https://www.sos.wa.gov/elections/faq_vote_by_mail.aspx',
  },
  'West Virginia': {
    regUrl: 'https://ovr.sos.wv.gov/Register/Landing#Qualifications',
    infoUrl: 'https://sos.wv.gov/about/Pages/Covid-19.aspx',
  },
  'Wisconsin': {
    regUrl: 'https://myvote.wi.gov/en-us/RegisterToVote',
    infoUrl: 'https://elections.wi.gov/voters/absentee',
  },
  'Wyoming': null,
}


/**
 * Returns the desired StatePortal, or null if the state doesn't have one.
 */
export const getStatePortal = (state: State): StatePortal | null => {
  return statePortal[state]
}
