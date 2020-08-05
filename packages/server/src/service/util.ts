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
 * Based on: https://stackoverflow.com/a/6117889/9611230
 */
export const weekNumber = (d: Date = new Date()): string => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7))

  const firstDayOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  // Calculate full weeks to nearest Thursday
  const number = Math.ceil(
    (((date.valueOf() - firstDayOfYear.valueOf()) / 86400000) + 1) / 7
  )

  // If the month is January and week number is above 5, it belongs to the
  // previous year
  const previousYear = date.getUTCMonth() === 0 && number > 5
  const year = previousYear ? date.getUTCFullYear() - 1 : date.getUTCFullYear()

  return `${year}.${number}`
}

// Returns a boolean indicating if the cache should be updated, also updates
// the cacheVer file when needed.
const handleCacheVer = (options?: Options): boolean => {
  const yearWeek = weekNumber()
  const workDir = options?.workDir ?? `${__dirname}/cache`
  const path = `${workDir}/cacheVer`
  const encoding = 'utf-8'

  if (fs.existsSync(path)) {
    if(fs.readFileSync(path, { encoding }) === yearWeek) return false
  }

  fs.writeFileSync(path, yearWeek, { encoding })
  return true
}

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
