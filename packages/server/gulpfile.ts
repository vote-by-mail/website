/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs'
import yaml from 'js-yaml'
import gulp from 'gulp'
import minimist from 'minimist'
import { safeReadFileSync, uint8ToString } from './src/service/util'
import envs from '../../env/env.js'
const run = require('@tianhuil/gulp-run-command').default

// Helper functions

const options = minimist(process.argv.slice(2), {})

const runEnv = (cmd: string, env?: Record<string, unknown>) => run(
  cmd,
  { env : env ? env : envs[options.env] }
)

const envRequired = async (cb: VoidFunction) => {
  if (!options?.env || !envs[options?.env]) {
    throw Error('env is not set.  Must set valid env')
  }
  cb()
}

interface Data {
  env_variables: string
}

function setAppYaml(cb: VoidFunction, env: string) {
  // gcloud requires env vars to be written into app.yaml file directly
  const inputBuf = safeReadFileSync('app.tmpl.yaml')
  const data = yaml.safeLoad(uint8ToString(inputBuf)) as Data
  data['env_variables'] = env
  const outputStr = yaml.safeDump(data)
  fs.writeFileSync('app.yaml', outputStr, 'utf8')
  cb()
}

// start
gulp.task('start',
  runEnv(
    'ts-node-dev --respawn --transpileOnly src/index.ts',
    envs.development
  )
)

// script
gulp.task('script',
  gulp.series(
    envRequired,
    async () => {
      const args = (Object.entries(options)
        .filter(([key, _]) => key !== '_')
        .map(([key, val]) => `--${key} ${val}`)
        .join(' '))
      return runEnv(`ts-node-dev --transpileOnly ${options.script} ${args}`)()
    }
  )
)

// emulator
gulp.task('emulator',
  runEnv(`firebase emulators:exec --only firestore`)
)

// test
gulp.task('test', runEnv('jest \\.test\\.ts', envs.test ))

gulp.task('test', async () => {
  const watch = options.watch ? '--watchAll' : ''
  const kind  = options.e2e ? 'e2e' : options.ext ? 'ext' : 'test'
  const baseCommand =`jest \\.${kind}\\.ts ${watch}`
  switch (kind) {
    case 'e2e': {
      return runEnv(`firebase emulators:exec --only firestore "${baseCommand} --testTimeout=10000"`, envs.test)()
    }
    case 'ext': {
      return runEnv(`${baseCommand} --maxWorkers=1 --testTimeout=30000`, envs.test)()
    }
    case 'test': {
      return runEnv(baseCommand, envs.test)()
    }
  }
})

// build
gulp.task('tsc', runEnv('tsc --build'))
gulp.task('pug', () => gulp.src('./src/views/*.pug').pipe(gulp.dest('./dist/views')))
gulp.task('md', () => gulp.src('./src/service/letter/views/*.md').pipe(gulp.dest('./dist/service/letter/views')))
gulp.task('png', () => gulp.src('./src/service/letter/*.png').pipe(gulp.dest('./dist/service/letter')))
gulp.task('jpg', () => gulp.src('./src/service/letter/*.jpg').pipe(gulp.dest('./dist/service/letter')))
gulp.task('pdf', () => gulp.src('./src/service/pdfForm/forms/*.pdf').pipe(gulp.dest('./dist/service/pdfForm/forms')))
gulp.task('check', (cb) => {
  const executable = './dist/index.js'
  if (!fs.existsSync(executable)) throw Error(`Compile did not create ${executable}`)
  cb()
})

gulp.task('build',
  gulp.series(
    envRequired,
    gulp.parallel(
      'tsc',
      'pug',
      'md',
      'png',
      'jpg',
      'pdf',
    ),
    'check',
  )
)

// deploy
gulp.task('appsubst', gulp.series(
  envRequired,
  (cb) => setAppYaml(cb, envs[options.env])
))
gulp.task('gcloud', // --quiet disables interaction in gcloud
  async () => {
    const project = envs[options.env].GCLOUD_PROJECT
    if(!project) throw Error(`GCLOUD_PROJECT is not defined for env "${options.env}"`)
    return run(`gcloud app deploy --quiet --verbosity=info --project ${project}`)()
  }
)
gulp.task('tag', runEnv(`./tag.sh server ${options.env}`))

gulp.task('deploy', gulp.series(
  envRequired,
  'build',
  'appsubst',
  'gcloud',
  'tag',
))

gulp.task('deploy-index', async (cb) => {
    console.log('The following must be run from the command line.  It inexplicably fails from gulp:')
    console.log('')
    console.log(`  firebase --project ${envs[options.env].GCLOUD_PROJECT} deploy --only firestore:indexes`)
    console.log('')
    cb()
  }
)

gulp.task('dev-index',
  runEnv('./dev_index.sh')
)

gulp.task('clean',
  runEnv('rm -rf dist/*')
)

gulp.task('clobber', gulp.parallel(
  'clean',
  runEnv('rm -f cache/*')
))
