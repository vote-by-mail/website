import React from 'react'
import { client } from '../lib/trpc'
import { useAppHistory } from '../lib/path'
import { InitialDataContainer, VoterContainer, useDeepMemoize } from '../lib/unstated'
import { initializeAnalytics } from '../lib/analytics'
import { UTM } from '../common'
import { suggestLanguageToast } from '../lib/languages'

export const Initialize: React.FC = () => {
  const { oid } = useAppHistory()
  const { setInitialData } = InitialDataContainer.useContainer()
  const { conservativeUpdateVoter } = VoterContainer.useContainer()
  const { query } = useAppHistory()

  const utm: UTM = useDeepMemoize({
    utmSource: query['utm_source'],
    utmMedium: query['utm_medium'],
    utmCampaign: query['utm_campaign'],
    utmTerm: query['utm_term'],
    utmContent: query['utm_content'],
  })

  React.useEffect(() => {
    (async () => {
      // Load analytics once and only once
      const result = await client.fetchInitialData(oid)
      if(result.type === 'data') {
        setInitialData(result.data)
        const { facebookId, googleId } = result.data
        initializeAnalytics({ facebookId, googleId })
      }
    })()
  }, [oid, setInitialData])

  React.useEffect(suggestLanguageToast, [])

  React.useEffect(() => {
    conservativeUpdateVoter(utm)
  }, [conservativeUpdateVoter, utm])

  return <></>
}
