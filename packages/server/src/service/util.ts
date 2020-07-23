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

export const cache = <A extends unknown[], R>(
  func: AsyncFunc<A, R>,
  namer: AsyncFunc<A, string>,
  options?: Options,
): AsyncFunc<A, R> => {
  const refresh   = options?.refresh  ?? false,
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
