import marked from 'marked'
import { ImplementedState, NameParts } from '../../common'
// nunjucks is already configured at ./index.ts, not calling the function
// here to avoid conflicts (apparently it works similarly to dotenv.config,
// with a global instance keeping track of things)
import nunjucks from 'nunjucks'
import { RichStateInfo } from '../types'
import { staticDir } from '../util'

export class GenerateFollowUpLetter {
  readonly state: ImplementedState
  readonly email: string
  readonly name: string
  readonly nameParts: NameParts | undefined

  constructor(info: RichStateInfo) {
    this.state = info.state
    this.email = info.email
    this.name = info.name
    this.nameParts = info.nameParts
  }

  /**
   * Returns true or false depending if we have a follow up message for
   * this state.
   */
  shouldSendFollowUp() { return !!this.getLinks() }

  // Returns null if we do not plan to support links/follow up email for
  // the given state.
  private getLinks(): {
    howToFill: string
    howToTrack: string
    dropBoxLocations: string
  } | null {
    const markdownUrl = (s: string) => `[${s}](${s})`
    switch (this.state) {
      case 'Arizona': return {
        dropBoxLocations: markdownUrl('https://www.azcleanelections.gov/how-to-vote/early-voting/vote-by-mail#googlemap'),
        howToFill: markdownUrl('https://www.vote.org/absentee-ballot/arizona/'),
        howToTrack: markdownUrl('https://my.arizona.vote/AbsenteeTracker.aspx'),
      }
      case 'Florida': return {
        dropBoxLocations: markdownUrl('https://www.wtsp.com/article/news/politics/elections/drop-off-your-ballot-tampa-bay-florida/67-f4f066d8-2f09-4887-b095-7bee132c2136'),
        howToFill: markdownUrl('https://www.vote.org/absentee-ballot/florida/'),
        howToTrack: markdownUrl('https://registration.elections.myflorida.com/CheckVoterStatus'),
      }
      case 'Georgia': return {
        dropBoxLocations: markdownUrl('https://georgiapeanutgallery.org/2020/09/28/drop-box-locations-for-november-3-2020-election/'),
        howToFill: markdownUrl('https://www.acluga.org/en/instructions-fill-out-and-vote-your-georgia-absentee-ballot'),
        howToTrack: markdownUrl('https://www.mvp.sos.ga.gov/MVP/mvp.do'),
      }
      case 'Michigan': return {
        dropBoxLocations: `${markdownUrl('https://mvic.sos.state.mi.us/Clerk')} (enter your address to get the drop box address, please **never drop your ballot in another jurisdiction**).`,
        howToFill: markdownUrl('https://www.clickondetroit.com/decision-2020/2020/09/24/michigan-voting-by-mail-how-to-make-sure-you-fill-out-ballot-correctly/'),
        howToTrack: markdownUrl('https://mvic.sos.state.mi.us/'),
      }
      case 'Minnesota': return {
        dropBoxLocations: markdownUrl('https://www.sos.state.mn.us/elections-voting/other-ways-to-vote/vote-early-by-mail/'),
        howToFill: markdownUrl('https://www.sos.state.mn.us/media/4255/2020-general-absentee-ballot-instructions-for-registered-voters.pdf'),
        howToTrack: markdownUrl('https://mnvotes.sos.state.mn.us/AbsenteeBallotStatus.aspx'),
      }
      case 'New York': return {
        dropBoxLocations: markdownUrl('https://www.ny.gov/early-voting-and-absentee-voting-mail-or-dropbox'),
        howToFill: markdownUrl('https://www.elections.ny.gov/votingabsentee.html'),
        howToTrack: markdownUrl('https://nycabsentee.com/tracking'),
      }
      case 'Virginia': return {
        dropBoxLocations: markdownUrl('https://www.washingtonpost.com/graphics/2020/local/voting-locations-dc-maryland-virginia/'),
        howToFill: markdownUrl('https://www.elections.virginia.gov/media/formswarehouse/absentee-voting/ballots/ELECT-706.4-AB-Instructions-for-Voting-an-Absentee-Ballot_2-20.pdf'),
        howToTrack: markdownUrl('https://ballotscout.org/partners/5a8f1161-23a0-4fa0-8ec9-3e090e97e9b3/va-search'),
      }
      case 'Wisconsin': return {
        dropBoxLocations: markdownUrl('https://my.lwv.org/wisconsin/local-absentee-ballot-dropbox-and-early-voting-locations'),
        howToFill: markdownUrl('https://elections.wi.gov/sites/elections.wi.gov/files/2020-09/Uniform%20Absentee%20Instructions%20-%20Current%20-%20By-Mail%20Voters.pdf'),
        howToTrack: markdownUrl('https://myvote.wi.gov/es-ES/TrackMyBallot'),
      }
      default: return null
    }
  }

  /** Returns null if no follow up email template was found for the given state */
  md(): string | null {
    const { email, name, nameParts, state } = this
    const links = this.getLinks()
    if (!links) return null

    return nunjucks.render(
      staticDir('views/followUp/Base.md'),
      {
        ...links,
        email,
        state,
        name: nameParts ? nameParts.first : name,
      }
    )
  }

  /**
   * Returns the rendered HTML version of this.md()
   *
   * Returns null if no follow up email template was found for the given state
   */
  render(): string | null {
    const md = this.md()
    if (!md) return null

    return marked(md)
  }
}
