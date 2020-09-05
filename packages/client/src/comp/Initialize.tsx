import React from 'react'
import { client } from '../lib/trpc'
import { useAppHistory } from '../lib/path'
import { InitialDataContainer, VoterContainer, useDeepMemoize } from '../lib/unstated'
import { initializeAnalytics } from '../lib/analytics'
import { UTM, processEnvOrThrow } from '../common'
import { toast } from 'react-toastify'
import { RoundedButton } from './util/Button'
import { isIframeEmbedded } from '../lib/util'
import { getLanguageName } from '../lib/languages'

const url = processEnvOrThrow('REACT_APP_URL')

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

  React.useEffect(() => {
    // Google translation has some issues translating iframe embeds, we
    // also store if users have clicked on this message using local storage
    // which can also throw errors at embeds.
    if (isIframeEmbedded()) {
      return
    }

    // Only show this message if users are visiting the page for the first
    // time, or if they have previously clicked on the translate button
    // (If they ignore the toast the message is not shown again)
    const ignoreTranslationToast = localStorage.getItem('ignoreTranslationToast')
    if (ignoreTranslationToast) {
      return
    }

    // Get only first two letters from language code, ignoring additional
    // info like '-GB' in 'en-GB'
    const langCode = navigator.language.substr(0, 2)
    const langName = getLanguageName(langCode)
    if (langName && langName !== 'English') {
      const message = `This website is available in ${langName}, click on the button below to translate it.`
      const TranslateButton = () => (
        <a
          href={`https://translate.google.com/translate?hl=&sl=en&tl=${langCode}&u=${url}`}
        >
          <RoundedButton
            onClick={() => localStorage.removeItem('ignoreTranslationToast')}
          >
            Translate
          </RoundedButton>
        </a>
      )

      toast.info(<>{message}<br/><TranslateButton/></>)
      localStorage.setItem('ignoreTranslationToast', 'true')
    }
  }, [])


  React.useEffect(() => {
    conservativeUpdateVoter(utm)
  }, [conservativeUpdateVoter, utm])

  return <></>
}
