// Based on https://www.npmjs.com/package/env-cmd
if (process.env.IGNORE_ENV_FILE) { return; }

const {
  ALLOY_API_KEY,
  ALLOY_API_SECRET,
  ALLOY_SANDBOX_API_KEY,
  ALLOY_SANDBOX_API_SECRET,
  MG_API_KEY,
  TWILIO_SID,
  TWILIO_TOKEN,
  TWILIO_FAX_NUMBER,
  RECEIVE_FAX_NUMBER,
  SENDINBLUE_API_KEY,
  STAGING,
  DEV,
  PROD,
} = process.env.CI ? require('./secrets.sample.json') : require('./secrets.nogit.json')

// These are kept separately to keep development configs out of git
const { developmentRaw } = process.env.CI ? require('./env.dev.sample.js') : require('./env.dev.nogit.js')


const removeNullValues = (obj) => {
  Object.keys(obj).forEach(
    key => (obj[key] === null || obj[key] === undefined) && delete obj[key]
  )
  return obj
}

const base = removeNullValues({
  ALLOY_API_KEY: ALLOY_SANDBOX_API_KEY,
  ALLOY_API_SECRET: ALLOY_SANDBOX_API_SECRET,
  MG_API_KEY,
  TWILIO_SID,
  TWILIO_TOKEN,
  TWILIO_FAX_NUMBER,
  RECEIVE_FAX_NUMBER,
  SENDINBLUE_API_KEY,   // We are using the v3 API
  SENDINBLUE_LIST_ID: 4,  // This is just a fake testing list -- no emails will be sent
  USER_MAX_ORGS: 25,
  REACT_APP_BRAND_NAME: 'VoteByMail.io',
  REACT_APP_URL: 'https://votebymail.io/',
  REACT_APP_ELECTION_AND_DATE: 'the General Election on Tuesday, November 3rd, 2020',
  REACT_APP_FEEDBACK_ADDR: 'feedback@votebymail.io',
  REACT_APP_ELECTION_OFFICIAL_ADDR: 'elections@votebymail.io',
  REACT_APP_SUPPORT_ADDR: 'support@votebymail.io',
  MG_DOMAIN: 'email.votebymail.io',
  MG_FROM_ADDR: 'Vote by Mail Application <application@email.votebymail.io>',
  MG_REPLY_TO_ADDR: 'Vote by Mail Application <application@votebymail.io>',
  ELECTION_OFFICIAL_DATA_VERSION: 'data/2020-08-07',
  REACT_APP_GEORGIA_PRIMARY: undefined,
})

const development = removeNullValues({
  ...base,
  NODE_ENV: 'development',
  REACT_APP_ENVIRONMENT: 'development',
  GCLOUD_PROJECT: 'vbm-dev-281822',
  GOOGLE_APPLICATION_CREDENTIALS: './secrets/vbm-dev-281822-2ed2f90c5f75.json',
  REACT_APP_GOOGLE_UA: 'UA-164550246-2',
  REACT_APP_URL: 'http://localhost:3000/',
  FIRESTORE_URL: 'https://vbm-dev-281822.firebaseio.com',
  REACT_APP_SERVER: 'http://localhost:8080',
  GOOGLE_CLIENT_ID: DEV.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: DEV.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: DEV.SESSION_SECRET,
  GOOGLE_MAPS_API_KEY: DEV.GOOGLE_MAPS_API_KEY,
  REACT_APP_SHOW_DEV_INFO: 1,
  GOOGLE_CLIENT_CALLBACK: 'http://localhost:8080/auth/google/callback',
  GOOGLE_STORAGE_BUCKET: 'vbm-dev-281822.appspot.com',
  DEV_SERVER_PORT: 8080,
  REACT_APP_DEFAULT_ADDRESS: 1,
  REACT_APP_TIMEOUT: 2000,
  DEV_EMAIL: 'email@example.com',
  NUNJUNKS_DISABLE_CACHE: 1,
  TWILIO_DIVERT: 1,
  REACT_APP_MOCK: 1,
  ALLOY_MOCK: 1,
  ...developmentRaw,
})

const preview = removeNullValues({
  ...development,
  REACT_APP_BRAND_NAME: 'Dev.VoteByMail.io',
  REACT_APP_URL: 'http://dev.votebymail.io/',
  REACT_APP_SERVER: 'https://dev-app.votebymail.io/',
  GOOGLE_CLIENT_CALLBACK: 'https://dev-app.votebymail.io/auth/google/callback',
  REACT_APP_MOCK: 1,
})

const staging = removeNullValues({
  ...base,
  NODE_ENV: 'production',
  REACT_APP_ENVIRONMENT: 'staging',
  GCLOUD_PROJECT: 'vbm-staging-281822',
  GOOGLE_APPLICATION_CREDENTIALS: './secrets/vbm-staging-281822-17369f2f304b.json',
  REACT_APP_GOOGLE_UA: 'UA-171601425-2',
  REACT_APP_BRAND_NAME: 'Staging.VoteByMail.io',
  REACT_APP_URL: 'https://staging.votebymail.io/',
  FIRESTORE_URL: 'https://vbm-staging-281822.firebaseio.com',
  REACT_APP_SERVER: 'https://staging-app.votebymail.io/',
  GOOGLE_CLIENT_ID: STAGING.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: STAGING.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: STAGING.SESSION_SECRET,
  GOOGLE_MAPS_API_KEY: STAGING.GOOGLE_MAPS_API_KEY,
  GOOGLE_CLIENT_CALLBACK: 'https://staging-app.votebymail.io/auth/google/callback',
  GOOGLE_STORAGE_BUCKET: 'vbm-staging-281822.appspot.com',
  REACT_APP_MOCK: 1,
  REACT_APP_TIMEOUT: 10000,
  ALLOY_MOCK: 1,
  TWILIO_DIVERT: 1,
})

const production = removeNullValues({
  ...staging,
  NODE_ENV: 'production',
  REACT_APP_ENVIRONMENT: 'production',
  GCLOUD_PROJECT: 'vbm-prod-281822',
  GOOGLE_APPLICATION_CREDENTIALS: './secrets/vbm-prod-281822-9e04d7cdeb71.json',
  REACT_APP_GOOGLE_UA: 'UA-171601425-1',
  SENDINBLUE_LIST_ID: 3,  // This is the real list
  REACT_APP_BRAND_NAME: 'VoteByMail.io',
  REACT_APP_URL: 'https://votebymail.io/',
  FIRESTORE_URL: 'https://vbm-prod-281822.firebaseio.com',
  REACT_APP_SERVER: 'https://app.votebymail.io/',
  GOOGLE_CLIENT_ID: PROD.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: PROD.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: PROD.SESSION_SECRET,
  GOOGLE_MAPS_API_KEY: PROD.GOOGLE_MAPS_API_KEY,
  GOOGLE_CLIENT_CALLBACK: 'https://app.votebymail.io/auth/google/callback',
  GOOGLE_STORAGE_BUCKET: 'vbm-prod-281822.appspot.com',
  EMAIL_FAX_OFFICIALS: 1,
  TWILIO_DIVERT: undefined,
  RECORDS_ADDR: 'records@votebymail.io',
  ALLOY_MOCK: undefined,
  ALLOY_API_KEY,
  ALLOY_API_SECRET,
})

const test = removeNullValues({
  ...base,
  FIRESTORE_URL: 'http://localhost:8081',  // for e2e tests with firestore emulator
  NODE_ENV: 'test',
  REACT_APP_SERVER: 'https://example.com',
  REACT_APP_TIMEOUT: 2000,
  FIRESTORE_EMULATOR_HOST: 'localhost:8081',
  // For CI testing, use GOOGLE_MAPS_API_KEY from environment (secret)
  // Otherwise, use dev key
  GOOGLE_MAPS_API_KEY: process.env.CI ? process.env.GOOGLE_MAPS_API_KEY : DEV.GOOGLE_MAPS_API_KEY,
  DISABLE_ALLOY_TEST: process.env.CI ? 1 : undefined,
  MG_DISABLE: 1,
  TWILIO_DISABLE: 1,
})

const ci = removeNullValues({
  ...test,
  CI: 'true',
})

module.exports = {
  development,
  preview,
  staging,
  production,
  test,
  ci,
}
