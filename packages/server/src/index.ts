import Express from 'express'
import Morgan from 'morgan'
import { Response } from 'express'
import helmet from 'helmet'
import { AddressInfo } from 'net'
import cors from 'cors'
import { registerExpressHandler } from '@tianhuil/simple-trpc/dist/handler/express'
import bodyParser from 'body-parser'

import { processEnvOrThrow, IVbmRpc } from './common'
import { VbmRpc } from './service/trpc'
import { registerPassportEndpoints } from './service/org'
import { staticDir } from './service/util'
import { updateTimeSeries, createOrUpdateAnalyticsDashboard } from './analytics/'
import { registerLogWebhooksEndpoints } from './service/webhooks'
import { crossCheckRegistrationsCronjob } from './service/alloy/cronjob'

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

app.get('/cron/daily_total_sign_ups', async (req, res) => {
  // https://cloud.google.com/appengine/docs/standard/nodejs/scheduling-jobs-with-cron-yaml#validating_cron_requests
  if (req.get('X-Appengine-Cron')) {
    try {
      await updateTimeSeries()
      await createOrUpdateAnalyticsDashboard()
      res.status(200).send('')
    } catch(e) {
      console.error(e)
      res.status(500).send('')
    }
  } else {
    res.status(401).send('')
  }
})

app.get('/cron/cross_check', async (req, res) => {
  // https://cloud.google.com/appengine/docs/standard/nodejs/scheduling-jobs-with-cron-yaml#validating_cron_requests
  if (req.get('X-Appengine-Cron')) {
    try {
      await crossCheckRegistrationsCronjob()
      res.status(200).send('')
    } catch(e) {
      console.error(e)
      res.status(500).send('')
    }
  } else {
    res.status(401).send('')
  }
})

app.get('/_ah/warmup/', (_, res) => {
  res.status(200).send('')
})

app.get('/', (_, res: Response) => {
  res.render('index')
})

registerExpressHandler<IVbmRpc>(app, new VbmRpc(), { bodyParserOptions: { limit: '3MB' } })
registerPassportEndpoints(app)
registerLogWebhooksEndpoints(app)

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
