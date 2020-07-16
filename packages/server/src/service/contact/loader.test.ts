import { contactRecords, michiganRecords } from './loader'
import { availableStates } from '../../common'

describe('Contact loader', () => {
  test.each(availableStates)(
    `Non-trivial normalized records for %i`,
    async state => {
      expect(Object.keys((await contactRecords)[state]).length).toBeGreaterThan(10)
    }
  )

  test('Michigan Fipsrecords work', async () => {
    expect(Object.keys(await michiganRecords).length).toBeGreaterThan(10)
  })
})
