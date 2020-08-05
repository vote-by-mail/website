import { Letter } from '.'
import { sampleStateInfo, sampleMethod } from './sample'
import { implementedStates } from '../../common'

beforeAll(() => jest.setTimeout(10000))

test('Letter for all states render correctly', async () => {
  const confirmationId = 'sampleConfirmationId'

  const letters = await Promise.all(implementedStates.map(async state => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const info = await sampleStateInfo(state)
    return new Letter(
      info,
      sampleMethod,
      confirmationId
    )
  }))

  letters.forEach(letter => {
    expect(letter?.md('html')).toContain(confirmationId)
    /*
      A poor man's test for missing fields
      since most fields are '**{{field}}**'
    */
    expect(letter?.md('html')).not.toContain('****')
  })
})
