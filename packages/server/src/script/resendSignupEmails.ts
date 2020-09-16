import { FirestoreService } from '../service/firestore'
import { RichStateInfo } from '../service/types'
import { WithId } from '../common'
import { toContactMethod } from '../common'
import { sendAndStoreSignup } from '../service/signup'

const firestoreService = new FirestoreService()

interface ResendEmailsConditionData {
    reason: string
    previewFields: string[]
    query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
}

/**
 * The first element is the field Id, the second the field operation and the
 * third its value.
 */
type Where = [
    string,
    FirebaseFirestore.WhereFilterOp,
    unknown,
]

/**
 * Automates creating queries, tracking the fields used for previewFields.
 *
 * Please remember that FirebaseFirestore only accepts Date objects when
 * querying for time, numbers or string timestamps won't work here.
 *
 * @param reason The reason we're resending these emails
 * @param where The conditions filtering which emails have to be resent,
 * e.g. `['state', '==', 'New York'], ['email', '!=', 'email@votebymail.io']`
 */
export const makeResendEmailsConditions = (reason: string, ...where: Where[]): ResendEmailsConditionData => {
    const previewFields: string[] = []
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> | null = null

    for (const [field, op, value] of where) {
        // Initializes or compliment the query
        query = query
            ? query.where(field, op, value)
            : firestoreService.db.collection('StateInfo').where(field, op, value)

        previewFields.push(field)
    }

    if (!query) {
        throw new Error('You should specify a query to resend emails')
    }

    return { reason, previewFields, query }
}


// Used to help TS infer types from `require` statements correctly
interface ResendEmailsExport {
    conditions: ResendEmailsConditionData
}

const { conditions } = process.env.CI
    ? require('./data/conditions.sample.ts') as ResendEmailsExport
    : require('./data/conditions.nogit.ts') as ResendEmailsExport

/**
 * Resends emails to all confrimation IDs in list.
 * @param ids list of confirmation IDs
 */
const resendSignups = async (registrations: WithId<RichStateInfo>[], resendReason: string): Promise<void> => {
    console.log('Sending emails...')
    for (const info of registrations) {
        // Setup.
        const method = toContactMethod(info.contact)
        if (method == null) {
            console.log(`No contact method found for ${info.id}.`)
            continue
        }
        // Reading from Firestore seems to convert the method.faxes/email array into an IterableIterator,
        // so we need to convert it back into an Array for re-processing.
        method.faxes = Object.values(method.faxes)
        method.emails = Object.values(method.emails)

        const createdFriendlyString = info.created.toDate().toISOString().split('T')[0]
        const resendReasonAndOriginalDate = resendReason
            .concat(` Voter originally signed up for VoteByMail.io on ${createdFriendlyString}`)

        await sendAndStoreSignup(info, method, info.id, { resendReasonAndOriginalDate })
        console.log('Successfully sent emails for ' + info.id)
    }
}

/**
 * Logs in the console the preview of up to 10 registrations that matches
 * the conditions being queried.
 */
const logRegistrationPreviews = (registrations: WithId<RichStateInfo>[]) => {
    console.log('There are a total of %s entries for your query. Here is a sample:', registrations.length)
    // Prepare previews to be logged on console
    for (const registration of registrations.slice(0, 10)) {
        const preview = new Map<string, unknown>()
        const registrationMap = new Map(Object.entries(registration))

        for (const field of conditions.previewFields) {
            // Firestore queries accepts nested fields, i.e. `address.addressParts.state`,
            // we need to get those in the preview correctly
            if (field.indexOf('.') >= 0) {
                const split = field.split('.')
                // No need to throw or check the length of `split`, FirebaseFirestore
                // already performs checks on the inputs field
                const parent = registrationMap.get(split[0])

                // Recursively get values until we reach the end of `split`
                let value: Record<string, unknown> = parent
                // Ignoring the first element [0] since that's the parent
                for (const child of split.slice(1)) {
                    value = value[child] as Record<string, unknown>
                }

                preview.set(field, value)
            } else {
                preview.set(field, registrationMap.get('field'))
            }
        }

        console.log(preview)
    }
}

// Reads './data/conditions.ts' and resends emails to all voter sign ups that satisfy query.
const main = async () => {
    // Fetch registrations.
    const registrations = await firestoreService.query<RichStateInfo>(conditions.query)
    if (registrations == null || registrations.length == 0) {
        console.log('No voters found for specified conditions.')
        return
    }

    // Display registration previews.
    logRegistrationPreviews(registrations)

    // Get confirmation form user that emails should be sent.
    const confirmation = 'Would you like to resend emails to all of these voters and their election officials? [\'Y\' | \'N\']'
    const standardInput = process.stdin
    standardInput.setEncoding('utf-8')
    console.log(confirmation)
    standardInput.on('data', async (data) => {
        if (data.toString() != 'Y\n'){
            console.log('You typed something other than \'Y\'. Exiting.')
            process.exit()
        } else {
            await resendSignups(registrations, conditions.reason)
            process.exit()
        }
    })
}

main()
