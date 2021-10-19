import dayjs from 'dayjs'

import { formatDateRange, formatDateTimeLabel } from './dates'

describe('formatDateRange: different days, months, years', () => {
  const examples = [
    ['2021-09-14T00:00:00.000Z', '2021-09-14T00:00:00.000Z', 'Sep 14, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-09-21T00:00:00.000Z', 'Sep 14 - 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-10-21T00:00:00.000Z', 'Sep 14 - Oct 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2022-10-21T00:00:00.000Z', 'Sep 14, 2021 - Oct 21, 2022']
  ]

  test.each(examples)('%s, %s', (start, end, expected) => {
    expect(formatDateRange(dayjs(start), dayjs(end))).toEqual(expected)
  })
})

describe('formatDateTimeLabel', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', 'Sep 06, 2021 18:51'],
    ['2021-08-26T21:28:46.606Z', 'Aug 26, 2021 21:28']
  ]

  test.each(examples)('%s', (label, expected) => {
    expect(formatDateTimeLabel(label)).toEqual(expected)
  })
})
