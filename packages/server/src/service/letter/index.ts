import mailgun from 'mailgun-js'
import marked from 'marked'
import nunjucks from 'nunjucks'

import { processEnvOrThrow, StateInfo, ContactMethod, ImplementedState, formatPhoneNumber } from '../../common'
import { fillMinnesota, fillNewHampshire, fillNorthCarolina, fillMassachusetts, fillVirginia, fillKansas, fillWestVirginia, fillNorthDakota } from '../pdfForm'
import { staticDir } from '../util'

export const mg = mailgun({
  domain: processEnvOrThrow('MG_DOMAIN'),
  apiKey: processEnvOrThrow('MG_API_KEY'),
})

nunjucks.configure(staticDir('views/'), {
  autoescape: true,
  noCache: !!process.env.NUNJUNKS_DISABLE_CACHE
})

const envVars = {
  brandName: processEnvOrThrow('REACT_APP_BRAND_NAME'),
  brandUrl: processEnvOrThrow('REACT_APP_URL'),
  feedbackEmail: processEnvOrThrow('REACT_APP_FEEDBACK_ADDR'),
  electionsEmail: processEnvOrThrow('REACT_APP_ELECTION_OFFICIAL_ADDR'),
  election: processEnvOrThrow('REACT_APP_ELECTION_AND_DATE'),
}

const subject = (state: ImplementedState) => {
  switch (state) {
    case 'Wyoming': return 'Absentee Ballot Request'
    default: return 'Vote By Mail Request'
  }
}

export const pdfForm = async (info: StateInfo): Promise<Buffer | undefined> => {
  switch(info.state) {
    case 'Kansas': return fillKansas(info)
    case 'Massachusetts': return fillMassachusetts(info)
    case 'Minnesota': return fillMinnesota(info)
    case 'New Hampshire': return fillNewHampshire(info)
    case 'North Carolina': return fillNorthCarolina(info)
    case 'North Dakota': return fillNorthDakota(info)
    case 'Virginia': return fillVirginia(info)
    case 'West Virginia': return fillWestVirginia(info)
    default: return undefined
  }
}

const template = (state: ImplementedState): string => {
  switch(state) {
    case 'Arizona': return 'Arizona.md'
    case 'Florida': return 'Florida.md'
    case 'Georgia': return 'Georgia.md'
    case 'Kansas': return 'Kansas.md'
    case 'Maine': return 'Maine.md'
    case 'Maryland': return 'Maryland.md'
    case 'Massachusetts': return 'Massachusetts.md'
    case 'Michigan': return 'Michigan.md'
    case 'Minnesota': return 'Minnesota.md'
    case 'Nebraska': return 'Nebraska.md'
    case 'Nevada': return 'Nevada.md'
    case 'New Hampshire': return 'NewHampshire.md'
    case 'New York': return 'NewYork.md'
    case 'North Carolina': return 'NorthCarolina.md'
    case 'North Dakota': return 'NorthDakota.md'
    case 'Oklahoma': return 'Oklahoma.md'
    case 'Virginia': return 'Virginia.md'
    case 'West Virginia': return 'WestVirginia.md'
    case 'Wisconsin': return 'Wisconsin.md'
    case 'Wyoming': return 'Wyoming.md'
  }
}

/**
 * Jinja will often use the whitespace in our views/*.md files, rendering a
 * large amount of undesired empty lines. Albeit being possible to fix this
 * by tweaking said files, it is much easier to use a regexp which looks for
 * 2 or more consective empty lines and replaces them with 1 empty lines
 * (so paragraph breaks are still possible).
 *
 * @param s the content to be trimmed
 */
export const trimTwoOrMoreLines = (s: string) => s.replace(/(^(\s*)\n){2,}/gm, '\n')

export class Letter {
  readonly confirmationId: string
  readonly subject: string
  readonly method: ContactMethod
  readonly info: StateInfo
  readonly signatureAttachment?: mailgun.Attachment
  readonly idPhotoAttachment?: mailgun.Attachment
  readonly form?: Promise<Buffer | undefined>
  readonly resendReasonAndOriginalSignupDate?: string

  constructor(
    info: StateInfo,
    method: ContactMethod,
    confirmationId: string,
    resendReasonAndOriginalSignupDate?: string,
  ) {
    this.confirmationId = confirmationId
    this.subject = subject(info.state)
    this.method = method
    this.info = info,
    this.signatureAttachment = this.makeAttachment(info.signature, 'signature')
    this.idPhotoAttachment = this.makeAttachment(info.idPhoto, 'identification')
    this.form = pdfForm(info)
    this.resendReasonAndOriginalSignupDate = resendReasonAndOriginalSignupDate
  }

  /**
   * Returns a generated markdown of this Letter.
   * @param dest There's a few differences between the HTML standards used
   * in the main email providers and the one found around the web, dest
   * allows to adapt the resulted markdown for these differences.
   */
  md = (dest: 'email' | 'html') => {
    const method = this.method
    const md = nunjucks.render(
      template(this.info.state),
      {
        ...this.info,
        ...envVars,
        name: this.info.name,
        confirmationId: this.confirmationId,
        method: {
          ...method,
          faxes: method.faxes && method.faxes.map(formatPhoneNumber),
        },
        warning: !process.env.EMAIL_FAX_OFFICIALS,
        resendReasonAndOriginalSignupDate: this.resendReasonAndOriginalSignupDate,
        signature: dest === 'email' && this.signatureAttachment
          ? `cid:${this.signatureAttachment.filename}`
          : this.info.signature,
        idPhoto: dest === 'email' && this.idPhotoAttachment
          ? `cid:${this.idPhotoAttachment.filename}`
          : this.info.idPhoto,
      },
    )

    return trimTwoOrMoreLines(md)
  }

  /**
   * Parses the generated markdown for this Letter.
   * @param dest There's a few differences between the HTML standards used
   * in the main email providers and the one found around the web, dest
   * allows to adapt the resulted markdown for these differences.
   */
  render = (dest: 'email' | 'html') => marked(this.md(dest))

  /**
   * If image is empty or undefined then it returns undefined, on errors
   * (i.e. invalid image) it also returns undefined but logs the incident
   * on the console.
   *
   * @param image media metadata + Base64 encoded string
   * @param filename Will define the title of the filename
   */
  private makeAttachment = (image: string | undefined, filename: 'signature' | 'identification') => {
    if (!image) {
      return undefined
    }

    const match = image.match(/data:image\/(.+);base64,(.+)/)

    // Log on the console about invalid image
    if (!match) {
      console.log(`Unable to read image ${filename} image to ${this.info.email}. Omitting attachment.`)
      return undefined
    }

    const data = Buffer.from(match[2], 'base64')
    const filenameExt = `${filename}.${match[1]}`

    return new mg.Attachment({data, filename: filenameExt})
  }
}

export { sampleStateInfo, sampleLetter } from './sample'
