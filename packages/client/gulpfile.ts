/* eslint-disable no-undef */
import gulp from 'gulp'
import { envs } from '../../env/env.js'
import { options, runEnv, envRequired } from './src/common/gulpfile.js'

// start
gulp.task('start',
  runEnv(
    'react-app-rewired start',
    envs.development
  )
)

// build
gulp.task('build', gulp.series(
  envRequired,
  runEnv('react-app-rewired build')
))

// test
gulp.task('test', async () => {
  const watch = options.watch ? '' : '--watchAll=false'
  return runEnv(`react-app-rewired test ${watch}`, envs.test)()
})

// lint
gulp.task('lint', runEnv('eslint . --ext .ts,.tsx'))
gulp.task('lint:fix', runEnv('eslint . --ext .ts,.tsx --fix'))

// analyze
gulp.task('source-map', runEnv("source-map-explorer 'build/static/js/*.js'"))

gulp.task('analyze', gulp.series(
  'build',
  'source-map',
))

// deploy
gulp.task('now', runEnv(`now --prod ./build --local-config=./now.${options.env}.json --confirm`))
gulp.task('tag', runEnv(`./tag.sh client ${options.env}`))

gulp.task('deploy', gulp.series(
  envRequired,
  'build',
  'now',
  'tag',
))

// serve
gulp.task('serve', runEnv('serve -s ./build'))

// clean
gulp.task('clean',
  runEnv('rm -rf build/*')
)
