import { formatUnit, splitStreetAndNumber } from '../common'

describe('formatUnit removes unnecessary pounds', () => {
  const unit = [
    { raw: 'BLDG # 3', expected: 'BLDG 3' },
    { raw: '  APT #3  ', expected: 'APT 3' }, // intentional spacing to test trimming
    { raw: 'LOT 3', expected: 'LOT 3' }, // should do nothing to correct ones
    { raw: '3', expected: '# 3' },
    { raw: '#3', expected: '# 3' },
  ]

  test.each(unit)(
    'formatUnit works for %s',
    input => {
      expect(formatUnit(input.raw)).toBe(input.expected)
    },
  )
})

describe('splitStreetAndNumber works', () => {
  const street = [
    {
      raw: '267 1/2 Water St',
      expected: { street: 'Water St', number: '267 1/2' } },
    {
      raw: '  267.5   Water St  ', // intentional spacing to test trimming
      expected: { street: 'Water St', number: '267.5' } },
    {
      raw: '123 W Midlands Dr',
      expected: { street: 'Midlands Dr', number: '123 W' } },
    {
      raw: 'Ford House Office Building',
      expected: { street: 'Ford House Office Building', number: null },
    },
    {
      raw: '1/2 mile west of some reference',
      expected: { street: '1/2 mile west of some reference', number: null }
    },
  ]

  test.each(street)(
    'splitStreetAndNumber works for %s',
    input => {
      expect(splitStreetAndNumber(input.raw)).toEqual(input.expected)
    },
  )
})
