import { FirestoreService } from '../service/firestore'
import { processEnvOrThrow } from '../common'
import { RichStateInfo } from '../service/types'
import Bottleneck from 'bottleneck'
import { GenerateFollowUpLetter } from '../service/letter/generateFollowUpLetter'
import { sendFollowUpEmail } from '../service/mg'
import { writeFileSync } from 'fs'

const forceFollowUpDate: string = processEnvOrThrow('FORCE_FOLLOW_UP_DATE')
const firestore = new FirestoreService()
const limiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 100,
})

type InfoWithIdAndLetter = RichStateInfo & { id: string, followUpLetter: GenerateFollowUpLetter }
type Update = Partial<RichStateInfo> & { id: string }

const throttleSendFollowUpEmail = limiter.wrap(sendFollowUpEmail)

export const sendFollowUpEmails = async () => {
  // eslint-disable-next-line @typescript-eslint/camelcase
  const todayISO8601 = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const ignore10DaysInStorage = todayISO8601 >= forceFollowUpDate
  console.log(
    ignore10DaysInStorage
      ? `Because we're at/after FORCE_FOLLOW_UP_DATE (${forceFollowUpDate}) we're going to send follow up emails even to users who have not yet completed 10 days in storage`
      : `Because we're not at FORCE_FOLLOW_UP_DATE (${forceFollowUpDate}) we're not going to send follow up emails for users who have not yet completed 10 days in storage`
  )

  // A list of Sign up IDs that failed to be processed
  const failures: Array<{id: string, error: unknown}> = []

  // eslint-disable-next-line no-constant-condition
  let resend = true
  while (resend) {
    const now = new Date()
    const queryResult = await firestore.db.collection('StateInfo')
      .where('followUp.sent', '==', 0)
      .select('id', 'created', 'state', 'followUp', 'email', 'name', 'nameParts')
      .orderBy('created', 'asc')
      .limit(500)
      .get()

    if(queryResult.size) {
      console.log(`Queried ${queryResult.size} sign ups for follow up.`)

    } else {
      resend = false
      console.log(`Finished resending follow ups`)
    }

    const registrations = queryResult.docs.map(e => {
      const data = e.data() as InfoWithIdAndLetter
      try {
        // We only send sign ups for voters who are stored for at least 10
        // days in our records. Unless this job is running on FORCE_FOLLOW_UP_DATE,
        // then we send it to all voters who have not yet acquired their follow up
        // message.
        const createdMillis = data.created.toMillis()
        const has10DaysInStorage = now.valueOf() - createdMillis >= (1000 * 60 * 60 * 24 * 10)

        if (ignore10DaysInStorage || has10DaysInStorage) {
          return {
            id: e.id,
            email: data.email,
            followUpLetter: new GenerateFollowUpLetter(data),
          }
        }
      } catch (error) {
        failures.push({id: e.id, error})
      }

      return null
    }).filter(e => !!e) as InfoWithIdAndLetter[]

    if (registrations.length === 0) {
      console.log('Found no suitable sign ups for follow up, this might happen when the current iteration is running through records that have not yet 10 days in storage and we\'re not yet at FORCE_FOLLOW_UP_DATE.')
      return
    } else {
      console.log(`Found ${registrations.length} suitable sign ups for follow up, preparing to send them.`)
    }

    const updates = await Promise.all(
      // Null items are going to be filtered out of the promises array
      //
      // This function is not async because we don't want to await it to finish
      // before iterating the next item.
      registrations.map((info): Promise<Update | null> => {
        if (!info.followUpLetter.shouldSendFollowUp()) return new Promise(r => r(null))

        const bodyHTML = info.followUpLetter.render() as string
        const bodyMarkdown = info.followUpLetter.md() as string

        return throttleSendFollowUpEmail({
          bodyHTML,
          bodyMarkdown,
          voterEmail: info.email,
          voterId: info.id,
        })
          .then(mg => {
            if (mg?.id && info.id) {
              return {
                id: info.id,
                followUp: {
                  sent: now.valueOf(),
                  mgId: mg.id,
                }
              }
            }
            return null
          })
          .catch((error) => {
            failures.push({
              id: info.id,
              error
            })
            return null
          })
      })
    )

    // The filter removes empty items, the typecast is needed since TS still
    // believes there are null elements.
    try {
      const filteredUpdates = updates.filter(r => !!r) as Update[]
      await firestore.batchUpdateRegistrations(filteredUpdates)
      console.log(`Sent ${filteredUpdates.length} follow ups.`)
    } catch(e) {
      console.warn('Failed to update a batch of sign ups, users might get follow up emails twice.')
      console.error(e)
    }
  }

  if (failures.length) {
    console.log(`Writing failures into a log file...`)
    const fileName = `followUpErrors-${new Date().valueOf()}.json`
    writeFileSync(
      `${__dirname}/data/${fileName}`,
      JSON.stringify(failures, null, 2),
      { encoding: 'utf-8' },
    )
    console.log(`Saved errors to data/${fileName}`)
  }
}

if (require.main === module) {
  sendFollowUpEmails()
}
