import { formatUnit } from '../common'

describe('formatUnit correctly uses pounds', () => {
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
