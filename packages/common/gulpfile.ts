import gulp from 'gulp'
import minimist from 'minimist'
import { envs } from './env/env'
export { envs } from './env/env'

const run = require('@tianhuil/gulp-run-command').default

// Helper functions

type Envs =
  | 'ci'
  | 'development'
  | 'production'
  | 'staging'
  | 'test'

interface Options {
  script?: string
  e2e?: boolean
  ext?: boolean
  watch?: boolean
  env: Envs
}


export const options = minimist(process.argv.slice(2), {}) as unknown as Options

export const runEnv = (cmd: string, env?: Record<string, unknown>) => run(
  cmd,
  { env : env ? env : envs[options.env] }
)

export const envRequired = async (cb: VoidFunction) => {
  if (!options?.env || !envs[options?.env]) {
    throw Error('env is not set.  Must set valid env')
  }
  cb()
}

gulp.task('test', run('jest'))

// stub entries to prevent error
gulp.task('build', (cb) => { cb() })

gulp.task('test', (cb) => { cb() })

gulp.task('lint', (cb) => { cb() })
