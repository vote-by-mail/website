import { StorageFile } from './storage'
import { safeReadFile, staticDir } from './util'

const main = async () => {
  const buffer = await safeReadFile(staticDir('tests/storage.pdf'))
  const file = new StorageFile(staticDir('tests/storage.pdf'))
  const result = await file.upload(buffer)
  console.log(result)
  const reuslt2 = await file.getSignedUrl(24 * 60 * 60 * 1000)
  console.log(reuslt2)

}

main()
