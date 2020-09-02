import { Letter } from '.'
import { sampleStateInfo, sampleMethod, sampleLetter } from './sample'
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

test('letter.md trims unnecessary empty lines without messing paragraphs', async () => {
  const florida = await sampleLetter('Florida')
  if (!florida) throw new Error('Test cannot be completed since sample letter is null')
  const md = florida.md('html')

  // We still want two consecutive empty lines, since these are paragraph breaks
  expect(md.match(/(^( *)\n){2}/gm)).toBeTruthy()
  // We'll never want to have 3 or more consecutive empy lines
  expect(md.match(/(^( *)\n){3,}/gm)).toBeNull()
})
