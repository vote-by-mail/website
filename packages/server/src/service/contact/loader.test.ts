import { contactRecords, michiganRecords } from './loader'
import { availableStates } from '../../common'
import { testRoutine } from '../utilTests'

describe('Contact loader', () => {
  test.each(availableStates)(
    `Non-trivial normalized records for %i`,
    async state => {
      expect(Object.keys((await contactRecords)[state]).length).toBeGreaterThan(10)
    }
  )

  testRoutine('Michigan Fipsrecords work', async () => {
    expect(Object.keys(await michiganRecords).length).toBeGreaterThan(10)
  })
})
