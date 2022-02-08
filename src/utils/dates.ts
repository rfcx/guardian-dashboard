import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)

const dataArray: string[] = ['years', 'months', 'days', 'hours', 'minutes', 'seconds']

export const formatDateRange = (start: dayjs.Dayjs, end: dayjs.Dayjs): string => {
  if (start.year() !== end.year()) return start.format('MMM DD, YYYY') + ' - ' + end.format('MMM DD, YYYY')
  if (start.month() !== end.month()) return start.format('MMM DD') + ' - ' + end.format('MMM DD, YYYY')
  if (start.date() !== end.date()) return start.format('MMM DD') + ' - ' + end.format('DD, YYYY')
  return start.format('MMM DD, YYYY')
}

export const formatDateTimeRange = (start: string, end: string, timezone: string = 'UTC'): string => {
  if (isDateToday(start, timezone) && isDateToday(end, timezone)) {
    return `Today, ${formatTimeLabel(start, timezone)} - ${formatTimeLabel(end, timezone)}`
  }
  // yesterday - today => Yesterday X - Today Y
  if (isDateYesterday(start, timezone) && isDateToday(end, timezone)) {
    return `Yesterday ${formatTimeLabel(start, timezone)} - Today ${formatTimeLabel(end, timezone)}`
  }
  // yesterday - yesterday => Yesterday X-Y
  if (isDateYesterday(start, timezone) && isDateYesterday(end, timezone)) {
    return `Yesterday, ${formatTimeLabel(start, timezone)} - ${formatTimeLabel(end, timezone)}`
  }
  // other - today => 10 Dec - Today, Y
  if (isDateToday(end, timezone)) {
    return `${getDay(start, timezone)} - Today, ${formatTimeLabel(end, timezone)}`
  }
  // other - yesterday => 10 Dec - Yesterday, Y
  if (isDateYesterday(end, timezone)) {
    return `${getDay(start, timezone)} - Yesterday, ${formatTimeLabel(end, timezone)}`
  }
  // other
  if (getDay(start, timezone) === getDay(end, timezone)) {
    return `${getDay(start, timezone)}`
  } else return `${getDay(start, timezone)} - ${getDay(end, timezone)}`
}

export const formatDateTimeLabel = (label: string, timezone: string = 'UTC'): string => {
  return dayjs(label).tz(timezone).format('MMM DD, YYYY HH:mm')
}

export const formatDiffFromNow = (label: string, timezone: string = 'UTC'): any => {
  const dateDiff = dayjs.duration(dayjs().tz(timezone).diff(dayjs(label).tz(timezone)))
  return combineLabel(dateDiff)
}

export const inLast6Hours = (label: string): boolean => {
  return Date.now().valueOf() - new Date(label).valueOf() < 21600000
}

export const getLast6HoursLabel = (): string => {
  const now = Date.now().valueOf()
  return dayjs(now - 21600000).toISOString()
}

export const inLast24Hours = (label: string): boolean => {
  return Date.now().valueOf() - new Date(label).valueOf() < 86400000
}

export const isDateToday = (label: string, timezone: string = 'UTC'): boolean => {
  return dayjs(label).tz(timezone).isToday()
}

export const isDateYesterday = (label: string, timezone: string = 'UTC'): boolean => {
  return dayjs(label).tz(timezone).isYesterday()
}

export const getDay = (date: any, timezone: string = 'UTC'): string => {
  return dayjs(date).tz(timezone).format('DD MMM')
}

export const inLast1Minute = (labelFrom: string, labelTo: string): boolean => {
  return new Date(labelFrom).valueOf() - new Date(labelTo).valueOf() < 60000
}

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

function getEndLabel (count: number, item: string): string {
  if (count === 1) return item.substring(0, (item.length - 1))
  return item
}

export const formatDayTimeLabel = (label: string | any, timezone: string = 'UTC'): string => {
  return dayjs(label).tz(timezone).format('MMM DD, HH:mm')
}

export const getGmtDiff = (label: string, timezone: string = 'UTC'): string => {
  return dayjs(label).tz(timezone).format('Z')
}

export const getPlayerTime = (label: number): string => {
  return dayjs().startOf('day').add(Math.floor(label), 'seconds').format('m:ss')
}

export const formatDayWithoutTime = (date: any, timezone: string = 'UTC'): string => {
  return dayjs(date).tz(timezone).format('DD MMM YYYY')
}

export const formatTimeLabel = (label: string, timezone: string = 'UTC'): string => {
  return dayjs(label).tz(timezone).format('HH:mm')
}

export const getUtcTimeValueOf = (label: string): number => {
  return dayjs.utc(label).valueOf()
}
