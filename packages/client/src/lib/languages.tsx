import React from 'react'
import { processEnvOrThrow } from '../common'
import { toast } from 'react-toastify'
import { RoundedButton } from '../comp/util/Button'
import { isIframeEmbedded } from './util'

const url = processEnvOrThrow('REACT_APP_URL')

// Intersection of available Google Translate languages (https://translate.google.com/intl/en/about/languages/)
// and ISO-639-2 languages https://www.loc.gov/standards/iso639-2/php/code_list.php
const translateLangs = {
  af: 'Afrikaans',
  am: 'Amharic',
  ar: 'Arabic',
  az: 'Azerbaijani',
  be: 'Belarusian',
  bg: 'Bulgarian',
  bn: 'Bengali',
  bs: 'Bosnian',
  ca: 'Catalan',
  co: 'Corsican',
  cs: 'Czech',
  cy: 'Welsh',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  eo: 'Esperanto',
  es: 'Spanish',
  et: 'Estonian',
  eu: 'Basque',
  fa: 'Persian',
  fi: 'Finnish',
  // Google uses both tl and fil for Filipino (chrome defaults to fil)
  fil: 'Filipino',
  fr: 'French',
  fy: 'Western Frisian',
  ga: 'Irish',
  gd: 'Scottish Gaelic',
  gl: 'Galician',
  gu: 'Gujarati',
  ha: 'Hausa',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  ht: 'Haitian',
  hu: 'Hungarian',
  hy: 'Armenian',
  id: 'Indonesian',
  ig: 'Igbo',
  is: 'Icelandic',
  it: 'Italian',
  ja: 'Japanese',
  jv: 'Javanese',
  ka: 'Georgian',
  kk: 'Kazakh',
  km: 'Khmer',
  kn: 'Kannada',
  ko: 'Korean',
  ku: 'Kurdish',
  ky: 'Kirghiz',
  la: 'Latin',
  lb: 'Luxembourgish',
  lo: 'Lao',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mg: 'Malagasy',
  mi: 'Māori',
  mk: 'Macedonian',
  ml: 'Malayalam',
  mn: 'Mongolian',
  mr: 'Marathi',
  ms: 'Malay',
  mt: 'Maltese',
  my: 'Burmese',
  nb: 'Norwegian Bokmål',
  ne: 'Nepali',
  nl: 'Dutch',
  ny: 'Chichewa',
  pa: 'Punjabi',
  pl: 'Polish',
  ps: 'Pashto',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  rw: 'Kinyarwanda',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  sm: 'Samoan',
  sn: 'Shona',
  so: 'Somali',
  sq: 'Albanian',
  sr: 'Serbian',
  st: 'Southern Sotho',
  su: 'Sundanese',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  tg: 'Tajik',
  th: 'Thai',
  tk: 'Turkmen',
  // Google uses both tl and fil for Filipino (chrome defaults to fil)
  tl: 'Filipino',
  tr: 'Turkish',
  tt: 'Tatar',
  ug: 'Uyghur',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  xh: 'Xhosa',
  yi: 'Yiddish',
  yo: 'Yoruba',
  zh: 'Chinese',
  zu: 'Zulu',
} as const

type KeysOf <R> = R extends Record<infer K, unknown> ? K : never
type LanguageCode = KeysOf<typeof translateLangs>
const languages = Object.values(translateLangs)
type Language = typeof languages[number]

/**
 * Returns the English name of the given language code, if the language
 * is not available for Google Translation then this function returns null.
 */
export const getLanguageName = (langCode: LanguageCode): Language | null => {
  return translateLangs[langCode] ?? null
}

const messageForLanguage = (langName: Language): string => {
  switch (langName) {
    case 'Arabic':
      return '\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u062a\u0648\u0641\u0631 \u0628\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u060c \u0627\u0646\u0642\u0631 \u0641\u0648\u0642 \u0627\u0644\u0632\u0631 \u0623\u062f\u0646\u0627\u0647 \u0644\u062a\u0631\u062c\u0645\u062a\u0647\u002e'
    case 'Spanish':
      return 'Este sitio web está disponible en español, haga clic en el botón de abajo para traducirlo.'
    case 'French':
      return 'Ce site est disponible en français, cliquez sur le bouton ci-dessous pour le traduire.'
    case 'Korean':
      return '\uc774 \uc6f9 \uc0ac\uc774\ud2b8\ub294 \ud55c\uad6d\uc5b4\ub85c \uc81c\uacf5\ub429\ub2c8\ub2e4\u002e \ubc88\uc5ed\ud558\ub824\uba74 \uc544\ub798 \ubc84\ud2bc\uc744 \ud074\ub9ad\ud558\uc138\uc694\u002e'
    case 'Russian':
      return '\u042d\u0442\u043e\u0442 \u0432\u0435\u0431\u002d\u0441\u0430\u0439\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u043d\u0430 \u0440\u0443\u0441\u0441\u043a\u043e\u043c \u044f\u0437\u044b\u043a\u0435\u002c \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u043d\u043e\u043f\u043a\u0443 \u043d\u0438\u0436\u0435\u002c \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0435\u0433\u043e\u002e'
    case 'Filipino':
      return 'Magagamit ang website na ito sa Filipino, mag-click sa pindutan sa ibaba upang isalin ito.'
    case 'Vietnamese':
      return '\u0054\u0072\u0061\u006e\u0067 \u0077\u0065\u0062 \u006e\u00e0\u0079 \u0063\u00f3 \u0062\u1ea3\u006e \u0074\u0069\u1ebf\u006e\u0067 \u0056\u0069\u1ec7\u0074\u002c \u0062\u1ea5\u006d \u0076\u00e0\u006f \u006e\u00fa\u0074 \u0062\u00ea\u006e \u0064\u01b0\u1edb\u0069 \u0111\u1ec3 \u0064\u1ecb\u0063\u0068\u002e'
    case 'Chinese':
      return '\u8be5\u7f51\u7ad9\u6709\u4e2d\u6587\u7248\u672c\uff0c\u8bf7\u70b9\u51fb\u4e0b\u9762\u7684\u6309\u94ae\u8fdb\u884c\u7ffb\u8bd1\u3002'

    default:
      return `This website is available in ${langName}, click on the button below to translate it.`
  }
}

const translateButtonLabel = (langCode: LanguageCode) => {
  switch (langCode) {
    case 'ar': return '\u0644\u062a\u0631\u062c\u0645\u0629'
    case 'es': return 'traducir'
    case 'fil': return 'upang isalin'
    case 'tl': return 'upang isalin'
    case 'fr': return 'traduire'
    case 'ko': return '\ubc88\uc5ed\ud558\ub2e4'
    case 'ru': return '\u043f\u0435\u0440\u0435\u0432\u043e\u0434\u0438\u0442\u044c'
    case 'vi': return '\u0064\u1ecb\u0063\u0068'
    case 'zh': return '\u7ffb\u8bd1'
    default: return 'Translate'
  }
}

export const suggestLanguageToast = () => {
  const isEmbedded = isIframeEmbedded()
  // Only show this message if users are visiting the page for the first
  // time, or if they have previously clicked on the translate button
  // (If they ignore the toast the message is not shown again)
  //
  // We ignore the local storage if the user is visiting an embedded page.
  const ignoreTranslationToast = isEmbedded
    ? false
    : localStorage.getItem('ignoreTranslationToast')

  if (ignoreTranslationToast) {
    return
  }

  // Get only first two letters from language code, ignoring additional
  // info like '-GB' in 'en-GB'
  const langCode = navigator.language.split('-')[0] as LanguageCode

  const langName = getLanguageName(langCode)
  if (langName && langName !== 'English') {
    const message = messageForLanguage(langName)
    const TranslateButton = () => (
      <a
        href={`https://translate.google.com/translate?hl=&sl=en&tl=${langCode}&u=${url}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        <RoundedButton
          onClick={() => localStorage.removeItem('ignoreTranslationToast')}
        >
          {translateButtonLabel(langCode)}
        </RoundedButton>
      </a>
    )

    toast.info(<>{message}<br/><TranslateButton/></>)
    if (!isEmbedded) {
      localStorage.setItem('ignoreTranslationToast', 'true')
    }
  }
}
