import Twilio from 'twilio'
import { processEnvOrThrow } from '../common'

const client = Twilio(
  processEnvOrThrow('TWILIO_SID'),
  processEnvOrThrow('TWILIO_TOKEN'),
)
const from = processEnvOrThrow('TWILIO_FAX_NUMBER')
const divertFaxNumber = processEnvOrThrow('DIVERT_FAX_NUMBER')

const tos = (faxes: string[], force: boolean): string[] => {
  if (divertFaxNumber) {
    if (!divertFaxNumber) { // TODO Test to see if divertFaxNumber is e164
      console.log('It seems you might be trying to test' +
                  ' faxing but haven\'t set RECEIVE_FAX_NUMBER.')
      return []
    } else {
      return [divertFaxNumber]
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
