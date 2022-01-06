import dayjs from 'dayjs'
import { describe, expect, test } from 'vitest'

import { formatDateRange, formatDateTimeLabel, formatDateTimeRange, formatTimeLabel, twoDateDiffExcludeHours } from './dates'

// Date Range

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

describe('formatDateTimeRange', () => {
  const examples = [
    ['2022-01-06T14:29:00.075Z', '2022-01-06T14:35:00.075Z', 'Today, 21:29 - 21:35', 'Today, 14:29 - 14:35'],
    ['2022-01-05T14:29:00.075Z', '2022-01-06T14:35:00.075Z', 'Yesterday 21:29 - Today 21:35', 'Yesterday 14:29 - Today 14:35'],
    ['2022-01-05T14:29:00.075Z', '2022-01-05T14:35:00.075Z', 'Yesterday, 21:29 - 21:35', 'Yesterday, 14:29 - 14:35'],
    ['2022-01-02T14:29:00.075Z', '2022-01-06T14:35:00.075Z', '02 Jan - Today, 21:35', '02 Jan - Today, 14:35'],
    ['2022-01-02T14:29:00.075Z', '2022-01-05T14:35:00.075Z', '02 Jan - Yesterday, 21:35', '02 Jan - Yesterday, 14:35'],
    ['2021-12-07T16:29:00.075Z', '2021-12-07T16:34:35.395Z', '07 Dec', '07 Dec'],
    ['2021-11-25T13:20:02.075Z', '2021-11-25T13:26:58.395Z', '25 Nov', '25 Nov'],
    ['2021-12-22T12:27:00.075Z', '2021-12-24T13:34:35.395Z', '22 Dec - 24 Dec', '22 Dec - 24 Dec'],
    ['2021-09-14T00:00:00.000Z', '2021-10-21T00:00:00.000Z', '14 Sep - 21 Oct', '14 Sep - 21 Oct']
  ]

  test('Test different days, months, time with site timezone', () => {
    examples.forEach(([start, end, expected]) => {
      expect(formatDateTimeRange(start, end, 'Asia/Bangkok')).toEqual(expected)
    })
  })

  test('Test different days, months, time with UTC timezone', () => {
    examples.forEach(([start, end, notExpected, expected]) => {
      expect(formatDateTimeRange(start, end)).toEqual(expected)
    })
  })
})

// Date Label

describe('formatDateTimeLabel', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', 'Sep 07, 2021 01:51', 'Sep 06, 2021 18:51'],
    ['2021-08-26T21:28:46.606Z', 'Aug 27, 2021 04:28', 'Aug 26, 2021 21:28']
  ]

  test('Test different days, months, years, time with site timezone', () => {
    examples.forEach(([label, expected]) => {
      expect(formatDateTimeLabel(label, 'Asia/Bangkok')).toEqual(expected)
    })
  })

  test('Test different days, months, years, time with UTC timezone', () => {
    examples.forEach(([label, notExpected, expected]) => {
      expect(formatDateTimeLabel(label)).toEqual(expected)
    })
  })
})

describe('formatTimeLabel', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', '01:51', '18:51'],
    ['2021-08-26T21:28:46.606Z', '04:28', '21:28']
  ]

  test('Test different time with site timezone', () => {
    examples.forEach(([label, expected]) => {
      expect(formatTimeLabel(label, 'Asia/Bangkok')).toEqual(expected)
    })
  })

  test('Test different time with site timezone', () => {
    examples.forEach(([label, notExpected, expected]) => {
      expect(formatTimeLabel(label)).toEqual(expected)
    })
  })
})

// Date Difference

describe('twoDateDiffExcludeHours: get the difference between two days excluding hours if difference more than one day', () => {
  const examples = [
    ['2021-12-22T12:27:00.075Z', '2021-12-27T03:53:27.023Z', ' 4 days'],
    ['2021-12-07T16:29:00.075Z', '2021-12-07T16:46:36.176Z', ' 17 minutes 36 seconds']
  ]

  test('Test different days, months, years, time', () => {
    examples.forEach(([start, end, expected]) => {
      expect(twoDateDiffExcludeHours(start, end, true)).toEqual(expected)
    })
  })
})
