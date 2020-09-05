import { Letter, trimTwoOrMoreLines } from '.'
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

test('trimTwoOrMoreLines works as intended', () => {
  // Remember that some empty lines have spaces over them
  const input =
`zero empty lines
one empty line

two empty lines


four empty lines

\t\t

\t\t
 - First item


 - Second item

\t
              \t
 - Third item


 - Fourth item
`

  const output =
`zero empty lines
one empty line

two empty lines

four empty lines

 - First item

 - Second item

 - Third item

 - Fourth item
`

  expect(trimTwoOrMoreLines(input)).toBe(output)
})

test('letter.md trims unnecessary empty lines without messing paragraphs', async () => {
  const florida = await sampleLetter('Florida')
  if (!florida) throw new Error('Test cannot be completed since sample letter is null')
  const md = florida.md('html')

  // We still want to have single empty lines over the letters, since these
  // are made of `\n\n` and represent a line break.
  expect(md.match(/(^(\s*)\n){1}/gm)).toBeTruthy()
  // We never want 2 or more consecutive empty lines, since these add undesired
  // extra space.
  expect(md.match(/(^(\s*)\n){2,}/gm)).toBeNull()
})
