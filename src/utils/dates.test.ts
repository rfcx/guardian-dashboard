import dayjs from 'dayjs'
import { describe, expect, test } from 'vitest'

import { formatDateRange, formatDateTimeLabel, twoDateDiffExcludeHours } from './dates'

describe('formatDateRange: different days, months, years', () => {
  const examples = [
    ['2021-09-14T00:00:00.000Z', '2021-09-14T00:00:00.000Z', 'Sep 14, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-09-21T00:00:00.000Z', 'Sep 14 - 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2021-10-21T00:00:00.000Z', 'Sep 14 - Oct 21, 2021'],
    ['2021-09-14T00:00:00.000Z', '2022-10-21T00:00:00.000Z', 'Sep 14, 2021 - Oct 21, 2022']
  ]

  test('Can format different days, months, years', () => {
    examples.forEach(([start, end, expected]) => {
      expect(formatDateRange(dayjs(start), dayjs(end))).toEqual(expected)
    })
  })
})

describe('formatDateTimeLabel: different days, months, years, time', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', 'Sep 06, 2021 21:51'],
    ['2021-08-26T21:28:46.606Z', 'Aug 27, 2021 00:28']
  ]

  test('Can format different days, months, years, time', () => {
    examples.forEach(([label, expected]) => {
      expect(formatDateTimeLabel(label)).toEqual(expected)
    })
  })
})

describe('twoDateDiffExcludeHours: get the difference between two days excluding hours if difference more than one day', () => {
  const examples = [
    ['2021-12-22T12:27:00.075Z', '2021-12-27T03:53:27.023Z', ' 4 days'],
    ['2021-12-07T16:29:00.075Z', '2021-12-07T16:46:36.176Z', ' 17 minutes 36 seconds']
  ]

  test('Can format different days, months, years, time', () => {
    examples.forEach(([start, end, expected]) => {
      expect(twoDateDiffExcludeHours(start, end, true)).toEqual(expected)
    })
  })
})
