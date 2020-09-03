import Express from 'express'
import Morgan from 'morgan'
import { Response } from 'express'
import helmet from 'helmet'
import { AddressInfo } from 'net'
import cors from 'cors'
import { registerExpressHandler } from '@tianhuil/simple-trpc/dist/handler/express'
import crypto from 'crypto'
import multer from 'multer'
import bodyParser from 'body-parser'

import { processEnvOrThrow, IVbmRpc } from './common'
import { VbmRpc } from './service/trpc'
import { registerPassportEndpoints } from './service/org'
import { staticDir } from './service/util'
import { updateTimeSeries } from './analytics/'
import { logMailgunLogToGCP } from './service/mg'
import { MailgunHookBody } from './service/webhooks'

const app = Express()

// logging middleware
app.use(Morgan('combined'))
app.use(helmet())
app.use('/static', Express.static(__dirname + '/static'))
app.use(cors({ origin: true }))
app.use(bodyParser.urlencoded({extended: false}))

app.set('view engine', 'pug')
app.set('views', staticDir('pug'))

app.get('/_ah/warmup', (_, res) => {
  res.status(200).send('')
})

app.get('/cron/daily_total_sign_ups', async (_, res) => {
  try {
    await updateTimeSeries()
    res.status(200).send('')
  } catch(e) {
    console.error(e)
    res.status(500).send('')
  }
})

app.get('/_ah/warmup/', (_, res) => {
  res.status(200).send('')
})

app.get('/', (_, res: Response) => {
  res.render('index')
})

app.post('/mailgun_logging_webhook', multer().none(), async (req, res) => {
  // Mailgun webhook posts are multipart requests, we need to manually stream
  // data from the request to this array then parse its buffered content as JSON
  //
  // https://www.mailgun.com/blog/a-guide-to-using-mailguns-webhooks/.
  const rawBody: Uint8Array[] = []

  // Awaits for all req.body content
  req.addListener('data', (chunk) => rawBody.push(chunk))
  await new Promise(resolve => req.addListener('end', () => resolve(true)))

  const buffer = Buffer.concat(rawBody)
  const body = JSON.parse(buffer.toString('utf-8')) as MailgunHookBody

  // More details about MG webhook security at
  // https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
  const value = body.signature.timestamp + body.signature.token
  const hash = crypto.createHmac('sha256', processEnvOrThrow('MG_API_KEY'))
      .update(value)
      .digest('hex')

  if (hash !== body.signature.signature) {
    console.error('Invalid signature in request to Mailgun webook.')
    res.sendStatus(401)
    return res.end()
  }

  logMailgunLogToGCP(body)
  res.sendStatus(200)
  return res.end()
})

registerExpressHandler<IVbmRpc>(app, new VbmRpc(), { bodyParserOptions: { limit: '3MB' } })
registerPassportEndpoints(app)

// https://github.com/GoogleCloudPlatform/nodejs-getting-started/tree/master/1-hello-world
if (module === require.main) {
  // Google supplies PORT for the server (although it's now 8081, not 8080)
  // https://cloud.google.com/appengine/docs/flexible/nodejs/runtime#environment_variables
  // However, create react app server listens on PORT, so use DEV_SERVER_PORT in dev to avoid collision
  // On deployed instances (staging / production), use PORT
  // https://github.com/facebook/create-react-app/issues/3513
  const port = parseInt(process.env.PORT || processEnvOrThrow('DEV_SERVER_PORT'))
  const server = app.listen(port, () => {
    const port = (server.address() as AddressInfo).port
    console.log(`app listening on port ${port}`)
  })
}

export default app
