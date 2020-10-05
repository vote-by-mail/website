import { FirestoreService } from '../service/firestore'
import { RichStateInfo } from '../service/types'
import { WithId } from '../common'
import { toContactMethod } from '../common'
import { sendAndStoreSignup } from '../service/signup'
import { safeReadFileSync } from '../service/util'
import readline from 'readline'
import _ from 'underscore'

const firestoreService = new FirestoreService()

interface ResendEmailsConditionData {
    reason: string
    previewFields: string[]
    queries: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>[]
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
 * Allows to construct a Where from a csv file. We automatically consider
 * the first row of the csv to be the field being queried--e.g. if the first
 * row is 'address.state' this function will return ['address.state', op, ...mappedRows]
 *
 * @param fileName the name of the csv file to be read, we infer that this
 * file is located inside the `data` folder
 * @param op the operation to be done with the data acquired
 * @param map how each row (after the header) is processed, for example
 * when querying for dates use map = `row => new Date(Number.parseInt(row))`
 */
export const whereFromCSV = <OP extends 'in' | 'array-contains-any'>(
  fileName: string,
  op: OP,
  map: (s: string) => unknown,
): [string, OP, unknown[]] => {
    const file = safeReadFileSync(`${__dirname}/data/${fileName}`)
    const rows = file.toString('utf8')
        .replace(/\r\n/g, '\n') // Compatibility between Windows and Unix
        .split('\n')
        .filter(r => !!r) // Some editors might add a final empty line when saving the file

    return [rows[0], op, rows.slice(1).map(map)]
}

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
    const queries: Array<FirebaseFirestore.Query<FirebaseFirestore.DocumentData>> = []

    // 'IN' operator only takes up to 10 items
    const needsToSplitQuery = where.some(([_, op, val]) => {
        return op === 'in' && (val as Array<unknown>)?.length > 10
    })
    let currentQueryIndex = 0
    // Initializes or compliment the query
    const pushWhereCondition = (where: Where) => {
        queries[currentQueryIndex] = queries[currentQueryIndex]
            ? queries[currentQueryIndex]?.where(where[0], where[1], where[2])
            : firestoreService.db.collection('StateInfo').where(where[0], where[1], where[2])
    }


    if (needsToSplitQuery) {
        const whereInIndex = where.findIndex(w => w[1] === 'in' || w[1] === 'array-contains-any')
        const whereIn = where[whereInIndex] as [string, 'in' | 'array-contains-any', string[]]
        previewFields.push(whereIn[0])
        for (const chunk of _.chunk(whereIn[2], 10)) {
            for (const w of where.filter((_, index) => index !== whereInIndex)) {
                previewFields.push(w[0])
                pushWhereCondition(w)
            }
            pushWhereCondition([whereIn[0], whereIn[1], chunk])
            currentQueryIndex += 1
        }
    } else {
        for (const w of where) {
            pushWhereCondition(w)
            previewFields.push(w[0])
        }
    }

    if (queries.length === 0) {
        throw new Error('You should specify a query to resend emails')
    }

    return { reason, previewFields, queries }
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
        // Reading from Firestore seems to convert the method.faxes/email array into an IterableIterator,
        // so we need to convert it back into an Array for re-processing.
        info.contact.faxes = info.contact.faxes ? Object.values(info.contact.faxes) : undefined
        info.contact.emails = info.contact.emails ? Object.values(info.contact.emails) : undefined

        const method = toContactMethod(info.contact)
        if (method == null) {
            console.log(`No contact method found for ${info.id}.`)
            continue
        }
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
                preview.set(field, registrationMap.get(field))
            }
        }

        console.log(preview)
    }
}

// Reads './data/conditions.ts' and resends emails to all voter sign ups that satisfy query.
const main = async () => {
    let hasConfirmed = false
    for (const query of conditions.queries) {
        // Fetch registrations.
        const registrations = await firestoreService.query<RichStateInfo>(query)
        if (registrations == null || registrations.length == 0) {
            console.log('No voters found for specified conditions.')
            return
        }

        // Display registration previews.
        logRegistrationPreviews(registrations)

        // Get confirmation form user that emails should be sent.
        const confirmation = `Would you like to resend emails to all of these voters and their election officials? ['Y' | 'N']\n`
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        if (!hasConfirmed) {
            await new Promise(resolveInput => rl.question(confirmation, async (data) => {
                if (data.toString() !== 'Y'){
                    console.log('You typed something other than \'Y\'. Exiting.')
                    rl.close()
                    rl.removeAllListeners()
                    process.exit()
                } else {
                    await resendSignups(registrations, conditions.reason)
                    rl.close()
                    rl.removeAllListeners()
                    hasConfirmed = true
                    resolveInput()
                }
            }))
        } else {
            await resendSignups(registrations, conditions.reason)
        }
    }

    process.exit()
}

main()
