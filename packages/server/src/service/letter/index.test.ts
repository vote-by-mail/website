import { Letter, trimThreeOrMoreLines } from '.'
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

test('trimThreeOrMoreLines works as intended', () => {
  // Remember that some empty lines have spaces over them
  const input =
`zero empty lines
one empty line

two empty lines
\t\t\t

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
  // Should replace three or more consecutive empty lines with just two,
  // while preserving indentation/leading spaces of the next line, eg.:
  //
  // ```
  // first line
  //
  //
  //
  //
  //   - second line
  // ```
  //
  // Should become:
  // ```
  // first line
  //
  //
  //   - second line
  // ```
  const trimmed = trimThreeOrMoreLines(input)

  // We still want two consecutive empty lines, since these are paragraph
  // breaks, but never 3 or more empty consecutive lines
  expect(trimmed.match(/(^(\s*)\n){2}/gm)).toBeTruthy()
  expect(trimmed.match(/(^(\s*)\n){3,}/gm)).toBeNull()

  // Check if the right spacing is preserved after trimming
  expect(trimmed.indexOf('\n - First item')).toBeGreaterThan(-1)
})

test('letter.md trims unnecessary empty lines without messing paragraphs', async () => {
  const florida = await sampleLetter('Florida')
  if (!florida) throw new Error('Test cannot be completed since sample letter is null')
  const md = florida.md('html')

  expect(md.match(/(^(\s*)\n){2}/gm)).toBeTruthy()
  expect(md.match(/(^(\s*)\n){3,}/gm)).toBeNull()
})
