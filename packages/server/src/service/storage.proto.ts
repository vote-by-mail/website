import { StorageFile } from './storage'
import { safeReadFile } from './util'

const main = async () => {
  const buffer = await safeReadFile(__dirname + '/test/test.pdf')
  const file = new StorageFile('test/test.pdf')
  const result = await file.upload(buffer.toString('utf-8'))
  console.log(result)
  const reuslt2 = await file.getSignedUrl(24 * 60 * 60 * 1000)
  console.log(reuslt2)

}

main()
