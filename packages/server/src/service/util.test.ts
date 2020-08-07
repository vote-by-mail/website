import { weekNumber } from './util'

test('weekNumber returns the correct values', () => {
  // You can verify these values here: http://myweb.ecu.edu/mccartyr/isowdcal.html

  // Remember that when using `new Date`, JAN = 0, FEB = 1, ...
  // Days are still normal, so 08/05/2020 is new Date(2020, 7, 5)
  expect(weekNumber(new Date(2020, 7, 5))).toBe(`2020-32`)
  expect(weekNumber(new Date(2020, 10, 3))).toBe(`2020-45`)
  // Checks if detecting weeks that belong to the previous year
  expect(weekNumber(new Date(2012, 0, 1))).toBe(`2011-52`)
})
