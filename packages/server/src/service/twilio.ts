import Twilio from 'twilio'
import { processEnvOrThrow } from '../common'

const client = Twilio(
  processEnvOrThrow('TWILIO_SID'),
  processEnvOrThrow('TWILIO_TOKEN'),
)
const from = processEnvOrThrow('TWILIO_FAX_NUMBER')
const receiveFax = process.env['RECEIVE_FAX_NUMBER']

/** phone numbers must be E164 for Twilio: https://www.twilio.com/docs/glossary/what-e164 */
const regex = /^\D*1?\D*(\d{3})\D*(\d{3})\D*(\d{4})\D*$/
export const e164 = (number: string): string => {
  const parts = number.match(regex)
  if (!parts) throw Error(`Regex failed to match fax ${number}`)
  return '+1' + parts.splice(1,).join('')
}

const tos = (faxes: string[], force: boolean): string[] => {
  if (process.env.TWILIO_DIVERT) {
    if (!receiveFax) {
      console.log("It seems you might be trying to test" +
                  " faxing but haven't set RECEIVE_FAX_NUMBER.")
      return []
    } else {
      return [receiveFax]
    }    
  }
  if (!!process.env.EMAIL_FAX_OFFICIALS || force) return faxes
  return []
}

export const sendFaxes = async (url: string, faxes: string[], force = false) => {
  if (process.env.TWILIO_DISABLE) { // to disable Twilio for testing
    console.info('No fax sent (disabled)')
    return []
  }

  return Promise.all(
    tos(faxes, force).map(to => client.fax.faxes
      .create({
        from,
        to,
        mediaUrl: url
      })
    )
  )
}
