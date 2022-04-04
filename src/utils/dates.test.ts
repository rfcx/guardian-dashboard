import dayjs from 'dayjs'
import { describe, expect, test } from 'vitest'

import { formatDateRange, formatDateTime, formatDateTimeRange, formatTwoDateDiff, getDayAndMonth, getPlayerTime, getTzAbbr, toTimeStr, twoDateDiffExcludeHours } from './dates'

// ----------------------------
// Format Date Range
// ----------------------------

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
  // Replace the data near today/yesterday with the current date
  const examples = [
    // ['2022-01-06T14:29:00.075Z', '2022-01-06T14:35:00.075Z', 'Today, 21:29 - 21:35', 'Today, 14:29 - 14:35'],
    // ['2022-01-05T14:29:00.075Z', '2022-01-06T14:35:00.075Z', 'Yesterday 21:29 - Today 21:35', 'Yesterday 14:29 - Today 14:35'],
    // ['2022-01-05T14:29:00.075Z', '2022-01-05T14:35:00.075Z', 'Yesterday, 21:29 - 21:35', 'Yesterday, 14:29 - 14:35'],
    // ['2022-01-02T14:29:00.075Z', '2022-01-06T14:35:00.075Z', '02 Jan - Today, 21:35', '02 Jan - Today, 14:35'],
    // ['2022-01-02T14:29:00.075Z', '2022-01-05T14:35:00.075Z', '02 Jan - Yesterday, 21:35', '02 Jan - Yesterday, 14:35'],
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

// ----------------------------
// Format Date and Time
// ----------------------------

describe('formatDateTime', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', 'Sep 07, 2021 01:51', 'Sep 06, 2021 18:51'],
    ['2021-08-26T21:28:46.606Z', 'Aug 27, 2021 04:28', 'Aug 26, 2021 21:28']
  ]

  test('Test different days, months, years, time with site timezone', () => {
    examples.forEach(([label, expected]) => {
      expect(formatDateTime(label, 'Asia/Bangkok')).toEqual(expected)
    })
  })

  test('Test different days, months, years, time with UTC timezone', () => {
    examples.forEach(([label, notExpected, expected]) => {
      expect(formatDateTime(label)).toEqual(expected)
    })
  })
})

describe('toTimeStr', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', '01:51', '18:51'],
    ['2021-08-26T21:28:46.606Z', '04:28', '21:28']
  ]

  test('Test different time with site timezone', () => {
    examples.forEach(([label, expected]) => {
      expect(toTimeStr(label, 'Asia/Bangkok')).toEqual(expected)
    })
  })

  test('Test different time with UTC timezone', () => {
    examples.forEach(([label, notExpected, expected]) => {
      expect(toTimeStr(label)).toEqual(expected)
    })
  })
})

describe('getDayAndMonth', () => {
  const examples = [
    ['2021-09-06T18:51:19.707Z', '07 Sep', '06 Sep'],
    ['2021-08-26T21:28:46.606Z', '27 Aug', '26 Aug']
  ]

  test('Test different days, months with site timezone', () => {
    examples.forEach(([label, expected]) => {
      expect(getDayAndMonth(label, 'Asia/Bangkok')).toEqual(expected)
    })
  })

  test('Test different days, months with UTC timezone', () => {
    examples.forEach(([label, notExpected, expected]) => {
      expect(getDayAndMonth(label)).toEqual(expected)
    })
  })
})

// ----------------------------
// Manipulate
// ----------------------------

describe('getPlayerTime', () => {
  const examples = [
    [3.712, '0:03'],
    [7.275, '0:07'],
    [77.275, '1:17']
  ]

  test('Test for getting a correct player time', () => {
    examples.forEach(([label, expected]) => {
      expect(getPlayerTime(label as number)).toEqual(expected)
    })
  })
})

// ----------------------------
// Durations
// ----------------------------

describe('twoDateDiffExcludeHours: get the difference between two days excluding hours if difference more than one day', () => {
  const examples = [
    ['2021-12-22T12:27:00.075Z', '2021-12-27T03:53:27.023Z', ' 4 days'],
    ['2021-12-07T16:29:00.075Z', '2021-12-07T16:46:36.176Z', ' 17 minutes'],
    ['2021-12-07T13:29:00.075Z', '2021-12-07T16:46:36.176Z', ' 3 hours'],
    ['2021-11-07T13:29:00.075Z', '2021-12-07T16:46:36.176Z', ' 1 month 3 hours']
  ]

  test('Test different days, months, years, time', () => {
    examples.forEach(([start, end, expected]) => {
      expect(twoDateDiffExcludeHours(start, end, true)).toEqual(expected)
    })
  })
})

describe('formatTwoDateDiff: response times difference', () => {
  const examples = [
    ['2021-12-26T16:15:13.820Z', '2021-12-27T04:18:34.239Z', ' 12 hours 3 minutes'],
    ['2021-12-24T16:15:13.820Z', '2021-12-27T04:18:34.239Z', ' 2 days 12 hours 3 minutes'],
    ['2021-12-27T04:15:15.514Z', '2021-12-27T04:17:00.250Z', ' 1 minute 44 seconds'],
    ['2020-12-27T04:15:15.514Z', '2021-12-27T04:17:00.250Z', ' 1 year 1 minute 44 seconds']
  ]

  test('Test different days, months, years, time', () => {
    examples.forEach(([start, end, expected]) => {
      expect(formatTwoDateDiff(start, end)).toEqual(expected)
    })
  })
})

// ----------------------------
// Time Zone
// ----------------------------

describe('getTzAbbr: List of common timezones https://abbreviations.yourdictionary.com/articles/common-world-time-zone-abbreviations.html', () => {
  const examples = [
    ['2022-02-23T03:46:10.627Z', 'Asia/Shanghai', 'GMT+8'],
    ['2022-02-23T08:20:02.257Z', 'America/Los_Angeles', 'PST'],
    ['2022-02-21T16:30:06.348Z', 'Asia/Bangkok', 'GMT+7'],
    ['2022-01-24T15:38:48.685Z', 'America/Chicago', 'CST'],
    ['2022-02-23T07:01:25.765Z', 'America/Panama', 'EST'],
    ['2022-02-23T07:25:38.861Z', 'America/New_York', 'EST']
  ]

  test('Test getting timezone abbreviation', () => {
    examples.forEach(([label, timezone, expected]) => {
      expect(getTzAbbr(label, timezone)).toEqual(expected)
    })
  })
})
