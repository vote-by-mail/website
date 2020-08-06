import { RichStateInfo } from './types'
import { FirestoreService } from './firestore'
import { processEnvOrThrow } from '../common'

let fs: FirestoreService
const oid = 'org'

const main = async () => {
  fs = new FirestoreService(processEnvOrThrow('GCLOUD_PROJECT'))
  const id = await fs.addRegistration({
    oid,
    name: {first: 'Bob', last: 'Smith'},
    state: 'Florida',
  } as RichStateInfo)
  console.log(id)
}

main()
