import React from 'react'
import { client } from '../lib/trpc'
import { useAppHistory } from '../lib/path'
import { InitialDataContainer, VoterContainer, useDeepMemoize } from '../lib/unstated'
import { initializeAnalytics } from '../lib/analytics'
import { UTM, processEnvOrThrow } from '../common'
import { toast } from 'react-toastify'
import { RoundedButton } from './util/Button'

type SiteLanguage = 'es' | 'zh' | 'tl' | 'vi' | 'ar' | 'fr' | 'ko' | 'ru'

/**
 * Shows the first non-English language that users can use to render the
 * website.
 */
const getSecondLanguage  = (locales: readonly string[]): SiteLanguage | null => {
  // Adding /g flag so results are always string[],
  const supportedLanguages = /^(es|zh|tl|vi|ar|fr|ko|ru)/g

  const indexOf = locales.findIndex(s => s.match(supportedLanguages))

  if (indexOf === -1) return null

  // Removes the country from language, e.g. 'en-GB' becomes 'en', we do
  // this in order to use SiteLanguage on google translator URLs
  const language = locales[indexOf].match(supportedLanguages)
  return language ? language[0] as SiteLanguage : null
}

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
    const { languages } = navigator
    const secondLanguage = getSecondLanguage(languages)
    if (secondLanguage) {
      // Translation of the paragraph below:
      //
      // This website is available in ${secondLanguage}, click on the button
      // below to translate it.
      const message = () => {
        // Using \uXXXX instead of literal characters in some languages so
        // all editors can properly see this file.
        switch (secondLanguage) {
          case 'ar':
            return '\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u062a\u0648\u0641\u0631 \u0628\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u060c \u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0627\u0644\u0632\u0631 \u0623\u062f\u0646\u0627\u0647 \u0644\u062a\u0631\u062c\u0645\u062a\u0647\u002e'
          case 'es':
            return 'Este sitio web está disponible en español, haga clic en el botón de abajo para traducirlo.'
          case 'fr':
            return 'Ce site est disponible en français, cliquez sur le bouton ci-dessous pour le traduire.'
          case 'ko':
            return '\uc774 \uc6f9 \uc0ac\uc774\ud2b8\ub294 \ud55c\uad6d\uc5b4\ub85c \uc81c\uacf5\ub429\ub2c8\ub2e4\u002e \ubc88\uc5ed\ud558\ub824\uba74 \uc544\ub798 \ubc84\ud2bc\uc744 \ud074\ub9ad\ud558\uc138\uc694\u002e'
          case 'ru':
            return '\u042d\u0442\u043e\u0442 \u0432\u0435\u0431\u002d\u0441\u0430\u0439\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u043d\u0430 \u0440\u0443\u0441\u0441\u043a\u043e\u043c \u044f\u0437\u044b\u043a\u0435\u002c \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443 \u043d\u0438\u0436\u0435\u002c \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0435\u0433\u043e\u002e'
          case 'tl':
            return 'Magagamit ang website na ito sa Filipino, mag-click sa pindutan sa ibaba upang isalin ito.'
          case 'vi':
            return '\u0054\u0072\u0061\u006e\u0067 \u0077\u0065\u0062 \u006e\u00e0\u0079 \u0063\u00f3 \u0062\u1ea3\u006e \u0074\u0069\u1ebf\u006e\u0067 \u0056\u0069\u1ec7\u0074\u002c \u0062\u1ea5\u006d \u0076\u00e0\u006f \u006e\u00fa\u0074 \u0062\u00ea\u006e \u0064\u01b0\u1edb\u0069 \u0111\u1ec3 \u0064\u1ecb\u0063\u0068\u002e'
          case 'zh':
            return '\u8be5\u7f51\u7ad9\u6709\u4e2d\u6587\u7248\u672c\uff0c\u8bf7\u70b9\u51fb\u4e0b\u9762\u7684\u6309\u94ae\u8fdb\u884c\u7ffb\u8bd1\u3002'
        }
      }
      // Translation of 'translate'
      const translateLabel = () => {
        switch (secondLanguage) {
          case 'ar': return '\u0644\u062a\u0631\u062c\u0645\u0629'
          case 'es': return 'traducir'
          case 'fr': return 'traduire'
          case 'ko': return '\ubc88\uc5ed\ud558\ub2e4'
          case 'ru': return '\u043f\u0435\u0440\u0435\u0432\u043e\u0434\u0438\u0442\u044c'
          case 'tl': return 'upang isalin'
          case 'vi': return '\u0064\u1ecb\u0063\u0068'
          case 'zh': return '\u7ffb\u8bd1'
        }
      }

      const Translate = () => (
        <a
          href={`https://translate.google.com/translate?hl=&sl=en&tl=${secondLanguage}&u=${url}`}
        >
          <RoundedButton>
            {translateLabel()}
          </RoundedButton>
        </a>
      )

      toast.info(<>{message()}<br/><Translate/></>)
    }
  }, [])


  React.useEffect(() => {
    conservativeUpdateVoter(utm)
  }, [conservativeUpdateVoter, utm])

  return <></>
}
