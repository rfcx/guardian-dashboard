import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import i18n from '@/locals/i18n'

const { t } = i18n.global

dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)

const dataArray: string[] = ['years', 'months', 'days', 'hours', 'minutes', 'seconds']

// ----------------------------
// Format Date Range
// ----------------------------

export const formatDateRange = (start: dayjs.Dayjs, end: dayjs.Dayjs): string => {
  if (start.year() !== end.year()) return start.format('MMM DD, YYYY') + ' - ' + end.format('MMM DD, YYYY')
  if (start.month() !== end.month()) return start.format('MMM DD') + ' - ' + end.format('MMM DD, YYYY')
  if (start.date() !== end.date()) return start.format('MMM DD') + ' - ' + end.format('DD, YYYY')
  return start.format('MMM DD, YYYY')
}

export const formatDateTimeRange = (start: string, end: string, timezone: string = 'UTC'): string => {
  if (isDateToday(start, timezone) && isDateToday(end, timezone)) {
    return `${t('Today')}, ${toTimeStr(start, timezone)} - ${toTimeStr(end, timezone)}`
  }
  // yesterday - today => Yesterday X - Today Y
  if (isDateYesterday(start, timezone) && isDateToday(end, timezone)) {
    return `${t('Yesterday')} ${toTimeStr(start, timezone)} - ${t('Today')} ${toTimeStr(end, timezone)}`
  }
  // yesterday - yesterday => Yesterday X-Y
  if (isDateYesterday(start, timezone) && isDateYesterday(end, timezone)) {
    return `${t('Yesterday')}, ${toTimeStr(start, timezone)} - ${toTimeStr(end, timezone)}`
  }
  // other - today => 10 Dec - Today, Y
  if (isDateToday(end, timezone)) {
    return `${getDayAndMonth(start, timezone)} - ${t('Today')}, ${toTimeStr(end, timezone)}`
  }
  // other - yesterday => 10 Dec - Yesterday, Y
  if (isDateYesterday(end, timezone)) {
    return `${getDayAndMonth(start, timezone)} - ${t('Yesterday')}, ${toTimeStr(end, timezone)}`
  }
  // other
  if (getDayAndMonth(start, timezone) === getDayAndMonth(end, timezone)) {
    return `${getDayAndMonth(start, timezone)}`
  } else return `${getDayAndMonth(start, timezone)} - ${getDayAndMonth(end, timezone)}`
}

// ----------------------------
// Format Date and Time
// ----------------------------

export const formatDateTime = (label: string, timezone: string = 'UTC'): string => {
  const month = t(dayjs(label).tz(timezone).format('MMM'))
  const date = dayjs(label).tz(timezone).format('DD, YYYY HH:mm')
  return `${month} ${date}`
}

export const formatDateTimeWithoutYear = (label: string | any, timezone: string = 'UTC'): string => {
  const month = t(dayjs(label).tz(timezone).format('MMM'))
  const date = dayjs(label).tz(timezone).format('DD, HH:mm')
  return `${month} ${date}`
}

export const getDayAndMonth = (date: any, timezone: string = 'UTC'): string => {
  const day = dayjs(date).tz(timezone).format('DD')
  const month = t(dayjs(date).tz(timezone).format('MMM'))
  const item = `${day} ${month}`
  return `${item.substring(0, (item.length - 3))}${t(item.substr(item.length - 3))}`
}

export const getDay = (date: any, timezone: string = 'UTC'): string => {
  return dayjs(date).tz(timezone).format('DD')
}

export const toHumanDateStr = (date: any, timezone: string = 'UTC'): string => {
  const day = dayjs(date).tz(timezone).format('DD')
  const month = t(dayjs(date).tz(timezone).format('MMM'))
  const year = dayjs(date).tz(timezone).format('YYYY')
  return `${day} ${month} ${year}`
}

export const toDateStr = (date: any, timezone: string = 'UTC'): string => {
  return dayjs(date).tz(timezone).format('YYYY-MM-DD')
}

export const formatDiffFromNow = (label: string, timezone: string = 'UTC'): any => {
  const dateDiff = dayjs.duration(dayjs().tz(timezone).diff(dayjs(label).tz(timezone)))
  return combineLabel(dateDiff)
}

export const toTimeStr = (label: string, timezone: string = 'UTC'): string => {
  return dayjs(label).tz(timezone).format('HH:mm')
}

export const toHourStr = (label: string, timezone: string = 'UTC'): string => {
  return dayjs(label).tz(timezone).format('HH')
}

export const toMonthYearStr = (dayjs: any, timezone: string = 'UTC'): string => {
  const month = t(dayjs.tz(timezone).format('MMMM'))
  const year = t(dayjs.tz(timezone).format('YYYY'))
  return `${month} ${year}`
}

export const toIsoStr = (date: any): string => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
}

export const getLast6HoursLabel = (): string => {
  const now = Date.now().valueOf()
  return dayjs(now - 21600000).toISOString()
}

export const getUTCDate = (date: string): Date => {
  const d = new Date(date)
  const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  return utcDate
}

// ----------------------------
// Boolean
// ----------------------------

export const isDateToday = (label: string, timezone: string = 'UTC'): boolean => {
  return dayjs(label).tz(timezone).isToday()
}

export const isDateYesterday = (label: string, timezone: string = 'UTC'): boolean => {
  return dayjs(label).tz(timezone).isYesterday()
}

export const inLast1Minute = (labelFrom: string, labelTo: string): boolean => {
  return new Date(labelFrom).valueOf() - new Date(labelTo).valueOf() < 60000
}

export const inLast6Hours = (label: string): boolean => {
  return Date.now().valueOf() - new Date(label).valueOf() < 21600000
}

export const inLast24Hours = (label: string): boolean => {
  return Date.now().valueOf() - new Date(label).valueOf() < 86400000
}

// ----------------------------
// Durations
// ----------------------------

export const formatTwoDateDiff = (labelFrom: string, labelTo: string): any => {
  const dateDiff = dayjs.duration(dayjs(labelTo).diff(dayjs(labelFrom)))
  return combineLabel(dateDiff)
}

export const twoDateDiffExcludeHours = (labelFrom: string, labelTo: string, excludeHours?: boolean): any => {
  const dateDiff = dayjs.duration(dayjs(labelTo).diff(dayjs(labelFrom)))
  return combineLabel(dateDiff, excludeHours)
}

function combineLabel (dateDiff: duration.Duration, excludeHours?: boolean): string {
  let string = ''
  const data: any = Object.values(dateDiff)[0]
  dataArray.forEach((item: string) => {
    if (data[item] !== 0) {
      if (item === 'seconds' && (data.minutes !== 0 && data.hours !== 0) && excludeHours === undefined) return string
      if (excludeHours !== undefined && data.seconds !== 0 && item === 'seconds') {
        // do not include seconds
      } else if (excludeHours !== undefined && (data.hours !== 0 || data.days !== 0) && item === 'minutes') {
        // do not include minutes if hours, days exist
      } else if (excludeHours !== undefined && data.days !== 0 && item === 'hours') {
        // do not include hours if days exist
      } else string += ` ${(data[item] as string)} ${getEndLabel(data[item], item)}`
    }
  })
  return string
}

// ----------------------------
// Manipulate
// ----------------------------

function getEndLabel (count: number, item: string): string {
  if (count === 1) return t(item.substring(0, (item.length - 1)))
  return t(item)
}

export const getPlayerTime = (label: number): string => {
  return dayjs().startOf('day').add(Math.floor(label), 'seconds').format('m:ss')
}

// ----------------------------
// Time Zone
// ----------------------------

export const getGmtDiff = (label: string, timezone: string = 'UTC'): string | undefined => {
  return dayjs(label).tz(timezone).format('Z')
}

export const getTzAbbr = (label: string, timezone: string = 'UTC'): string | undefined => {
  return dayjs(label).tz(timezone).offsetName('short')
}

export const getUtcTimeValueOf = (label: string): number => {
  return dayjs.utc(label).valueOf()
}
