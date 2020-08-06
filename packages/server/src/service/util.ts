import fs from 'fs'


interface Options{
  refresh?: boolean
  workDir?: string
  encoding?: BufferEncoding
}
type AsyncFunc<A extends unknown[], R> = (...args: A) => Promise<R>

/**
 * Utility to copy buffer for shared ArrayBuffer issue
 * https://github.com/nodejs/node/issues/11132#issuecomment-277157700
 */
const copyBuffer = (buffer: Buffer): Buffer => Buffer.from(
  new Uint8Array(buffer).buffer
)

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param path A path to a file. If a URL is provided, it must use the
 * file: protocol. If a file descriptor is provided, the underlying file
 * will not be closed automatically.
 *
 * @param options An object that may contain an optional flag. If a flag
 * is not provided, it defaults to 'r'.
 */
export const safeReadFile = (
  path: fs.PathLike,
  options?: { encoding?: null | undefined, flag?: string | undefined },
) => new Promise<Buffer>((resolve, reject) => {
  fs.readFile(path, options, (err, data) => {
    err ? reject(err) : resolve(copyBuffer(data))
  })
})

/**
 * Reads the entire contents of a file.
 *
 * @param path A path to a file. If a URL is provided, it must use the
 * file: protocol. If a file descriptor is provided, the underlying file
 * will not be closed automatically.
 *
 * @param options An object that may contain an optional flag. If a flag
 * is not provided, it defaults to 'r'.
 */
export const safeReadFileSync = (
  path: fs.PathLike | number,
  options?: { encoding?: null | undefined, flag?: string | undefined },
) => copyBuffer(fs.readFileSync(path, options))


/**
 * Returns a string indicating the current week number. Since this function
 * follows ISO-8601, the first week of January might actually belong to
 * the previous year, which is why this function returns a string formatted
 * as `YYYY.WN` where YYYY is the year and WN the weeknumber.
 *
 * @param d exported for testing purposes, defaults to now when not present
 *
 * Based on: https://github.com/commenthol/weeknumber/blob/master/src/index.js
 */
export const weekNumber = (d: Date = new Date()): string => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const weekMS = 604800000 // = 7 * 24 * 60 * 60 * 1000 = 7 days in ms
  const minuteMS = 60000

  // day 0 is monday
  const day = (date.getDay() + 6) % 7
  // get thursday of present week
  const thursday = new Date(date)
  thursday.setDate(date.getDate() - day + 3)
  // set 1st january first
  const firstThursday = new Date(thursday.getFullYear(), 0, 1)
  // if Jan 1st is not a thursday...
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(0, 1 + (11 /* 4 + 7 */ - firstThursday.getDay()) % 7)
  }
  const timezoneDiff = (firstThursday.getTimezoneOffset() - thursday.getTimezoneOffset()) * minuteMS
  const number = 1 + Math.floor(
    (thursday.valueOf() - firstThursday.valueOf() + timezoneDiff) / weekMS
  )

  // If the month is January and week number is above 5, it belongs to the
  // previous year
  const previousYear = date.getUTCMonth() === 0 && number > 5
  const year = previousYear ? date.getUTCFullYear() - 1 : date.getUTCFullYear()

  return `${year}.${number}`
}

// Returns a boolean indicating if the cache should be updated, also updates
// the cacheVer file when needed.
const handleCacheVer = (): boolean => {
  const yearWeek = weekNumber()
  const path = `${__dirname}/cache/cacheVer`
  const encoding = 'utf-8'

  if (fs.existsSync(path)) {
    if(fs.readFileSync(path, { encoding }) === yearWeek) return false
  }

  fs.writeFileSync(path, yearWeek, { encoding })
  return true
}

/** `options.refresh` overwrites the default check for weekly cache update */
export const cache = <A extends unknown[], R>(
  func: AsyncFunc<A, R>,
  namer: AsyncFunc<A, string>,
  options?: Options,
): AsyncFunc<A, R> => {
  const refresh   = options?.refresh  ?? handleCacheVer(),
        workDir   = options?.workDir  ?? `${__dirname}/cache/`,
        encoding  = options?.encoding ?? 'utf-8'

  return async (...args: A): Promise<R> => {
    const path = workDir + '/' + await namer(...args)
    if (fs.existsSync(path) && !refresh) {
      const data = await fs.promises.readFile(path, { encoding } )
      return JSON.parse(data)
    } else {
      const ret = await func(...args)
      const data = JSON.stringify(ret)
      fs.writeFileSync(path, data, { encoding })
      return JSON.parse(data)
    }
  }
}

/**
 * Returns the absolute path to the static folder
 * @param fileName Optionally returns the path to a file in the static folder
 */
export const staticDir = (fileName?: string) => fileName
  ? `${__dirname}/static/${fileName}`
  : `${__dirname}/static`
