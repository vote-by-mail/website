// Intersection of available Google Translate languages (https://translate.google.com/intl/en/about/languages/)
// and ISO-639-2 languages https://www.loc.gov/standards/iso639-2/php/code_list.php
const translateLangs: Record<string, string> = {
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

/**
 * Returns the English name of the given language code, if the language
 * is not available for Google Translation then this function returns null.
 */
export const getLanguageName = (langCode: string): string | null => {
  return langCode ? translateLangs[langCode] : null
}
