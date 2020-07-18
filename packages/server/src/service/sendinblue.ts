import { processEnvOrThrow } from '../common'
import { ContactsApi, ContactsApiApiKeys } from 'sib-api-v3-typescript'

// Configure Authentication & API

const key = processEnvOrThrow('SENDINBLUE_API_KEY')
const listId = () => {
  const raw = processEnvOrThrow('SENDINBLUE_LIST_ID')
  return Number.parseInt(raw , 10)
}

class Sendinblue {
  private readonly contacts = new ContactsApi()

  // Initializes API keys
  constructor() {
    this.contacts.setApiKey(ContactsApiApiKeys.apiKey, key)
  }

  // Since we use Contact for election officials, Sendinblue contacts are
  // exported as subscribers to avoid confusion in the codebase

  /** Exported for testing purposes */
  public get listId() { return listId() }

  /**
   * Adds a new subscriber to VoteByMail newsletter, returns true if successful
   */
  public addSubscriber = async (email: string) => {
    const response = await this.contacts.createContact({
      email,
      emailBlacklisted: false,
      attributes: null,
      listIds: [this.listId],
      smsBlacklisted: true,
      smtpBlacklistSender: [],
      updateEnabled: true,
    })
    const statusCode = response?.response?.statusCode ?? 500

    // https://developers.sendinblue.com/reference#createcontact
    // When creating is 201, when updating (in case an user subscribes twice)
    // it is 204
    return statusCode === 201 || statusCode === 204
  }

  /**
   * Returns the details of a subscriber
   */
  public getSubscriber = (email: string) => this.contacts.getContactInfo(email)
}

export const sib = new Sendinblue()
