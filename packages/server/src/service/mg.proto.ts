import { toSignupEmailData, mg } from './mg'
import { sampleLetter } from './letter'

const main = async () => {
  const devEmail = process.env.DEV_EMAIL
  if (!devEmail) return

  const letter = await sampleLetter('Florida')
  if (!letter) return

  const emailData = toSignupEmailData(
    letter,
    devEmail,
    []
  )
  mg.messages().send({
    ...emailData,
    'h:Reply-To': 'bob@gmail.com,alice@gmail.com'
  }).then(
    (value) => console.log(value)
  )
  console.log(`Emailed ${devEmail}`)
}

main()
