import { AddressContainer } from '../../lib/unstated'

type VbmWording =
  | 'ballot-by-mail'
  | 'vote-by-mail ballot'
  | 'absentee ballot'
  | 'early voting ballot'
  | 'vote by mail'

export const vbmWording = (): VbmWording => {
  const { locale } = AddressContainer.useContainer()

  switch (locale?.state) {
    case 'Arizona': return 'ballot-by-mail'
    case 'Florida': return 'vote-by-mail ballot'
    case 'Georgia': return 'absentee ballot'
    case 'Maine': return 'absentee ballot'
    case 'Maryland': return 'absentee ballot'
    case 'Massachusetts': return 'absentee ballot'
    case 'Michigan': return 'absentee ballot'
    case 'Minnesota': return 'absentee ballot'
    case 'Nebraska': return 'early voting ballot'
    case 'Nevada': return 'absentee ballot'
    case 'New Hampshire': return 'absentee ballot'
    case 'New York': return 'absentee ballot'
    case 'North Carolina': return 'absentee ballot'
    case 'Oklahoma': return 'absentee ballot'
    case 'Wisconsin': return 'absentee ballot'
    case 'Wyoming': return 'absentee ballot'
    default: return 'vote by mail'
  }
}
