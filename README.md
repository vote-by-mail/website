# VoteByMail.io
![](https://github.com/vote-by-mail/website/workflows/Node.js%20CI/badge.svg)

## Getting Started

### Manual Dependencies
Almost all dependnecies are listed in devDependencies.  However, still depends on
- Install yarn (< 1) globally (`npm i -g yarn`)
- Install now globally (`npm i -g now`).
- To deploy the server using Google Cloud, follow the steps in `https://cloud.google.com/appengine/docs/standard/nodejs/quickstart`.

### Installation
In the root directory, run `yarn install`.

### Starting the dev server
To start the client and backend dev servers, run
```bash
yarn server gulp start // server on localhost:8080
yarn client gulp start // client on localhost:3000
```

These commands will likely fail until you have setup the configuration correctly (see below).

### Node version when developing on Linux
On many Linux distros, running the above command may yield compile errors for about `Array.flatMap` and `Object.fromEntries` not being functions.  This issue has been observed [here](https://github.com/vote-by-mail/website/issues/11) and [here](https://github.com/vote-by-mail/website/pull/19).  The root problem ([documented here](https://github.com/vote-by-mail/website/pull/19#issuecomment-643043047)) is that Nodejs v10 (default on Unix) does not support `Object.fromEntries` and `Array.flatMap`.  The solution is to use a more recent version of Node (^v12).  The easiest way for me was to [use nvm](https://github.com/nvm-sh/nvm).  This error does not arise in OSX.

### Configuration
Running the app requires some configuration setting.  All of those are exported in `env/env.js`.  It has two dependencies that are not checked into source control:

- **Dev Overrides**: `env.dev.nogit.js`: will generally work out of the box.  To run the backend services, you will want to override the existing configuration.

- **Application Secrets**: `secrets.nogit.json`: The secrets can be made empty strings (they must be defined for the server to work).  You can set them as you need to

## Configuration Details
Below are the settings that need to be set to get an environment to work.

- **Alloy**: Used to check voter registration status. Since [Alloy has a strict policy](https://docs.alloy.us/api/#section/Sandbox) regarding its API Key distribution, VoteByMail first checks for env variable `ALLOY_MOCK`, which when `true` makes the app consider every person inputted as a valid registered voter. In this case, to get an unregistered voter use the name "Unregistered Voter" (case insensitive). `ALLOY_MOCK` is set to `true` on development, but `false` on staging and production.

- **Mailgun**: You only need these to send emails (last step in signup flow).  It's easy to get set up for free.  Since you don't have access to our domain records, you will probabyl want to set your emails to be sent from the sanbox domain that mailgun sets up automatically when you sign up.

- **SendinBlue**: We use [SendinBlue](https://www.sendinblue.com/) for our newsletter.  Sign up for an account and grab your V3 API key [here](https://account.sendinblue.com/advanced/api).

- **Twilio**: You only need these to send faxes (last step in signup flow).  It's easy to get set up for free.

- **Incoming fax numbers**: To test Twilio, we setup an incoming fax number.  ([FaxBurner](https://www.faxburner.com/)) offers a free temporary one.  Set `DIVERT_FAX_NUMBER` to this number.

- **Dev Firestore Access**: Goto the [Firebase Console](https://console.firebase.google.com/u/0/project/vbm-dev-281822/settings/serviceaccounts/adminsdk) and generate a new key and place it in `packages/server/secrets/[...].json`.
Then make sure `env.js` has `GOOGLE_APPLICATION_CREDENTIALS` set to `./secrets/[...].json` (override using `developmentRaw`).

- **Google OAuth**: (development of organizer-facing pages only) Following the instructions [here](http://www.passportjs.org/docs/google/):

  1. Enable [Google+ API from the Console](https://console.developers.google.com/apis/api/plus.googleapis.com/overview?project=vbm-staging-281822)
  2. Once you have done the above, you should be able to turn on the [OAuth Conset screen](https://console.developers.google.com/apis/credentials/consent?project=vbm-staging-281822)
  3. Once you have done the above, you should be able to create [OAuth Credentials](https://console.developers.google.com/apis/credentials?project=vbm-staging-281822)

  Download and save these credentials for dev, prod, and staging.  Thes eare the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` fields.

For more details, check out [here](https://github.com/vote-by-mail/website/issues/30).

### Testing Individual services
To experiment with or verify an individual service, you can call the "prototype" files from the command line for the individual services, (e.g.):
```bash
yarn server gulp script --script src/service/mg.proto.ts --env development
```
To find a list of prototype calls, run:
```bash
git ls-files | grep proto
```

#### Google Maps API
You will have to enable Google Maps `geolocation` and `geocoding` APIs, then set `GOOGLE_MAPS_API_KEY` in order to do the ZIP code to state and address to election official lookups.  Instructions [here](https://developers.google.com/maps/documentation/geocoding/get-api-key).

#### Express session secrets
Set `SESSION_SECRET` to a random string of your choice to encrypt sessions.

## Repo Structure
The code is a lerna repo split into three packages:
- `packages/client`
- `packages/server`
- `packages/common` shared code symlinked between above to

Each package has it's own `gulpfile.js`.

### Running tasks
To invoke the grunt file, run commands like
```bash
yarn server gulp script --env development --file src/script/fetchData.ts
```

The command `yarn server gulp` and `yarn client gulp` run their respective gulpfiles.  Check out the gulpfiles for more commands.

### Checking repo
To check if the repo is working run the following four commands
```bash
yarn bootstrap && yarn build && yarn lint && yarn test
```
Please do this before you submit a PR.
ELECTION_OFFICIAL_DATA_VERSION
## Adding a State
To add a new state, you will need to complete the following steps:
1. Increment version number and publish a new version of the [elections official data](https://github.com/vote-by-mail/elections-officials), if you need updated data.
1. Match the version number in the environment variable `ELECTION_OFFICIAL_DATA_VERSION`, if you need updated data.
1. Add the state to `availableStates` and `implementedStates` const arrays in `common`.  This should start generating type errors from incomplete switch statements when you run
    ```bash
    yarn build
    ```
    Fixing those errors by pattern matching should get you a new state.  Becareful to follow the state-by-state regulations for VBM signup.  For reference, here are the core commits adding [Arizona](https://github.com/vote-by-mail/website/commit/arizona) and [New York](https://github.com/vote-by-mail/website/commit/new_york).

    Some states require us to fill out and submit their PDF form for the signup.  This means determining the `X/Y` coordinates for each input box.  Use the file `packages/server/src/service/pdfForm.proto.ts` as a test harness for laying out the application (see [New Hampshire](https://github.com/mail-my-ballot/mail-my-ballot/pull/33/files) for an example).


## Notes on Submitting Code
Please submit code via pull requests, ideally from this repo if you have access or from your own fork if you do not.
- We strive to only use [rebase merges](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)

## Hosting
The best way to showcase changes to your site is to host your own staging instance.  Each instance has its own configuration (e.g. `production` or `staging`) and can be edited via the gulpfile via `--env production`.  To add your own, copy and modify the contents the `staging` object in `env/env.js` using your own namespace (e.g. your GithubID).

### Now (Client Hosting)
The client is hosted by [Vercel](https://vercel.com/), which is also called Zeit and Now.  If you create and deploy to your own zeit hosting instance and point it to the dev or staging backend instance, you should be able to experiment / show off your own front-end.

### App Engine (Server Hosting)
To get started, goto [AppEngine Getting Started](https://console.cloud.google.com/appengine/start?project=vbm-staging-281822&folder&organizationId) and follow the prompts.

Don't forget to set indexes.  To do this, run the command resulting from
```bash
yarn server gulp deploy-index --env [environment]
```
(see the gulp file server's `gulpfile.js`).

### Secrets in deployed App Engine
Configuration environment variables (and hence secrets) in Google Appengine is through `app.yaml`.  We do not store this in git so that secrets are not exposed.  Instead, we store `app.tmpl.yaml` without secrets and fill in the environment variables in `app.yaml` dynamically via gulp:
```bash
yarn server gulp appsubst --env staging [environment]
```
This is automatically run as a part of
```bash
yarn server gulp deploy --env staging [environment]
```

Alternative (not used): follow this [SO answer](https://stackoverflow.com/a/54055525/8930600), put all secrets in a special file that is not stored in source control.

## Utility Scripts
You can fetch a VBM signup letter for an application via their signup confirmation id.  Run the following script:
```
yarn server gulp script --env production --script src/script/fetchLetter.ts --id [confirmation id]
```

## Resources
### Asthetics
- [MUI CSS Colors](https://www.muicss.com/docs/v1/getting-started/colors)
- [Gradient Codegen](https://cssgradient.io/)
- [IcoMoon](https://icomoon.io)

### Icons
We're using [IcoMoon](https://icomoon.io) for icons. In order to add/remove icons, please
import `packages/client/icons.json` to [your IcoMoon project](https://icomoon.io/app/#/projects). It will load all our used icons and preferences (such as class name prefixes) for this project. You can edit the list of used icons by selecting them on [the browse icons page](https://icomoon.io/app/#/select).

When you're done editing, go to [font generation page](https://icomoon.io/app/#/select/font) and download the file (it's a compressed zipped file). Uncompress the archive and rename `style.css` to `icons.css`, the same should be done to `selection.json` if you've updated the selected icons (as implied above, we store `selection.json` as `icons.json` at `packages/client/icons.json`).

Move `icons.css` and the folder `fonts` to `packages/client/public/`. To reduce bandwidth we automatically minify this file on `yarn client gulp build`.

### Markdown Library
We're using [Marked](https://www.npmjs.com/package/marked), which has more dependents, downloads, and is smaller than [Showdown](https://www.npmjs.com/package/showdown).  The documentation on how to run it in node is available [here](https://marked.js.org/#/USING_ADVANCED.md#options)

### Notifications
We're using [Toast](https://www.npmjs.com/package/react-toastify) for notifications.  The general style is to not report success, occasionally report queries about loading, and always report errors.

## Setting Up an Instance
Setting up an instance requires rewiring the environment variables in `env.js`.  Below are a set of checks to ensure that your new instance is working.  These checks assume that tests are passing and only check that the environment variables are set correctly.

Remember that if the client and server start up, there is already some confidence that the right variables are set (processEnvOrThrow would have thrown if no value were provided). However, it doesn't check that we have copied the correct API keys.

For every environment (e.g. development, staging, production),

- Make sure that the right environment variables are set for the right environment (e.g. staging `GCLOUD_PROJECT` and `GOOGLE_APPLICATION_CREDENTIALS` are set for staging and not production).
- Sign up for `default` org landing page
- Test Alloy voters status using `alloy.proto.ts`
- Test email API using `mg.proto.ts`
- Test newsletter signup API using `sendinblue.proto.ts`
- Test fax using `twillio.proto.ts`.  You need to set a valid incoming fax number for testing
- Test geocoding and Google Maps using `gm.proto.ts`.  Try an address in Michigan (for which there are separate rules) and
- Test pdf generation using `pdf.proto.ts`
- Test Google Storage using `storage.proto.ts`
- Test firestore using `firestore.proto.ts` (**NB:** thsis needs to be created)
- Make sure that the firestore permissions are not public (see `firestore.rules`)
- Test Google OAuth for the organizer account by logging in with a Gmail account
- Test that the right Google Analytics environment fired after you visited the site.
- Test the [organizer workflow](https://docs.google.com/document/d/1341vB4gQin_dPyweDQc_rUSAzch85Q8ouQbAjokxBCo/edit#heading=h.gjdgxs) -- signing up as an organizer, creating a custom landing page, registering as a voter on the custom landing page, and observing the voter's record -- works.  Clearly, this cannot be done on production.
- Test that submitting a voter from every state generates a confirmation email to the voter.  Check the corresponding firestore database and Google Storage for the environment (to ensure that the right project was added).  This cannot be done on production.  However, if this and all previous tests have worked in production, we should be highly confident that it will work in production as well.
- Get a resident of a state to sign up in production.
- Increase your billing quota in GCloud for production and staging.

## Setting Up an ArcGIS server

First you need to make sure you have a ArcGIS Developer Account with credits and the file with the layer you want to turn into a service (the layer can be in csv, shapefile or geojson formats)

The shapefile used to create the Michigan ArcGIS server can be found here: http://gis-michigan.opendata.arcgis.com/datasets/minor-civil-divisions-cities-townships-v17a

1. Log into your ArcGIS Developer Account and go to your Dashboard (https://developers.arcgis.com/dashboard)
2. Scroll down and find the Layers section and click on the `+ Create New Layer` square
3. Click on the `Select a file` button and upload the file that has your layer
4. On the `Settings` step make sure you select who can have access to that layer service on the `Share Layer` section
5. After your layer is created you will be prompted to its page where you can find the URL to access its service, you will be able to visualize your layer in different ways and further configure it if necessary
6. To figure out what endpoint and parameters to use navigate to the service layer page an click on the `View Service` button
7. On the bottom of the page click on the `Query` link
8. You will be prompted to a page where you can visually input your query parameters, after you are done inputing them you can click on the `Query (GET)` button on the bottom of the page and you will navigate to your endpoint

## Monitoring

When deploying your staging instance the app is going to automatically set up a routine to track the daily and total amount of sign ups.

If you’ve deployed the application before these analytics were implemented, it will be needed to redeploy your staging instance so `crontab.yaml` is uploaded to the GCP App Engine.

The monitoring analytics are executed periodically after every 3 hours.

### Plotting the data
Check that your analytics are working by visiting https://console.cloud.google.com/appengine/cronjobs?project=PROJECT-NAME and clicking on “Run now”, if no cron task is found verify that `crontab.yaml` was uploaded to the GCP App Engine. Clicking on "Run now" will ensure that the algorithm is working, it will also give us some initial data to plot on the GCP Monitoring dashboard.

`Note: You can run this cron job every time you wish to update these metrics, it's useful to see if everything is working after performing one or two sign ups.`

Visit https://console.cloud.google.com/monitoring/dashboards?project=PROJECT-NAME and create a new **dashboard**. A dashboard allows you to display a collection of **charts**, in this documentation you’ll get the instructions of how to set a single chart for each of the tracked values (total sign ups and daily sign ups), but it is possible to configure this dashboard as you see fit.

### Setting up Charts

Setting up charts is an easy task, first click on "Add chart" on the top right corner of the page, then type `custom/daily_sign_ups` in the resource/metric name and give the appropriate title for this chart (e.g. `Daily sign ups`). After setting the title and the watched metric set "Aggregator" to `max` and "Period" to custom and `3 hours`. Click on "Show Advanced Options", change "Aligner" to `max` and "Legend Template" to `Daily sign ups`.

After this, focus your attention on the area to the right side of this configuration menu, the one displaying the chart. Above the chart there's a ruler displaying time units (`1M`, `1H`, `1D`, etc), as you populate this metric with data you'll be able to choose bigger time windows (e.g. `1W`) but for now leave it at `1H`. If you don't see any data right after setting up the chart it's most likely to the fact that you don't have enough data in the period of `3 hours`, you can still verify that the metric is working by temporarily reducing the period to `1 minute` but remember to set it back to `3 hours` when leaving this page.

Repeat these steps for the "Total sign ups" chart, just remember to use `custom/total_sign_ups` instead of the previous metric and certify that you name the legends/titles accordingly.

### Per state charts

We also support plotting per state metrics, the steps to set up these are the same for the regular metrics, the only difference is that instead of `custom/daily_sign_ups` and `custom/total_sign_ups` we now have `custom/STATE_ABBREVIATION/daily_sign_ups` and `custom/STATE_ABBREVIATION/total_sign_ups` (note that in both cases the state abbreviation is in lowercase, if in doubt await for Google Cloud Monitoring dashboard autocomplete to pop in your screen when filling the fields related to these charts). We recommending plotting each of these groups (per-state daily/total sign ups) in the same chart to avoid oversaturating your own dashboard.

## Logging and Webhooks
We use Google Cloud Logging and Mailgun Webhooks to log and keep track of sent emails. The instructions to enable and set up Google Cloud Logging can be found [here](https://cloud.google.com/logging/docs/setup/nodejs#before_you_begin), and an article for setting up Mailgun webhooks is available [here](https://www.mailgun.com/blog/a-guide-to-using-mailguns-webhooks/).

For the above logging to work, set all Mailgun webhooks (except legacy ones) to the following address: `REACT_APP_SERVER/mailgun_logging_webhook`.

## Advanced Topics

### Testing Server Build
Sometimes, one wishes to test the compiled javascript version of the server rather than the interpreted typescript version.  Usually, the latter works.  The former is useful when tweaking with the server's build system or environment variables or anything else where you are not confident that the build appropriately translated the result.  In this case, run the following commands
```bash
yarn server gulp build
yarn server gulp serve
```


## About Us
This repository is for VoteByMail.io.

## Contributors
- [Tianhui Michael Li](https://github.com/tianhuil/)
- [Lukas Danin](https://github.com/ludanin/)
- [Marco Carvalho](https://github.com/marcoacfilho/)
- [Luca Loncar](https://github.com/Luca409/)
- [Long Ton That](https://github.com/longtonthat/)
