import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDateRange = (start: dayjs.Dayjs, end: dayjs.Dayjs): string => {
  if (start.year() !== end.year()) return start.format('MMM DD, YYYY') + ' - ' + end.format('MMM DD, YYYY')
  if (start.month() !== end.month()) return start.format('MMM DD') + ' - ' + end.format('MMM DD, YYYY')
  if (start.date() !== end.date()) return start.format('MMM DD') + ' - ' + end.format('DD, YYYY')
  return start.format('MMM DD, YYYY')
}

export const formatDateLabel = (label: string, timezone: string = 'UTC'): string => {
  if (timezone) return dayjs(label).tz(timezone).format('MMM DD, YYYY HH:mm')
  else return dayjs(label).format('MMM DD, YYYY HH:mm')
}

export const formatHoursLabel = (label: string, timezone?: string): any => {
  const hoursDiff = dayjs().tz(timezone).diff(label, 'hour')
  if (hoursDiff < 1) {
    if (timezone) return dayjs().tz(timezone).diff(label, 'minute') + ' minutes'
    else return dayjs().diff(label, 'minute') + ' min'
  }
  if (timezone) return dayjs().tz(timezone).diff(label, 'hour') + ' hours'
  else return dayjs().diff(label, 'hour') + ' hours'
}

export const formatDayLabel = (label: string, timezone?: string): string => {
  if (timezone) return dayjs(label).tz(timezone).format('MMM DD, HH:mm')
  else return dayjs(label).format('MMM DD, HH:mm')
}

export const formatDayWithoutTime = (date: any, timezone?: string): string => {
  if (timezone) return dayjs(date).tz(timezone).format('DD MMM YYYY')
  else return dayjs(date).format('DD MMM YYYY')
}

export const formatTimeLabel = (label: string, timezone?: string): string => {
  if (timezone) return dayjs(label).tz(timezone).format('hh:mm')
  else return dayjs(label).format('hh:mm')
}

export const hoursDiffFormatted = (labelFrom: string, labelTo: string): any => {
  const hoursDiff = dayjs().diff(labelTo, 'hour') - dayjs().diff(labelFrom, 'hour')
  if (hoursDiff < 1) {
    const minDiff = dayjs().diff(labelTo, 'minute') - dayjs().diff(labelFrom, 'minute')
    const secDiff = dayjs().diff(labelTo, 'second') - dayjs().diff(labelFrom, 'second')
    if (secDiff <= 1 && secDiff > 0) return `+ ${secDiff} sec`
    if (minDiff <= 0) return 0
    else return `+ ${minDiff} min`
  }
  if (hoursDiff >= 24) {
    const dayDiff = dayjs().diff(labelTo, 'day') - dayjs().diff(labelFrom, 'day')
    const hours = 24 * dayDiff
    return `+ ${dayDiff} d` + (hoursDiff - hours > 0 ? `${hoursDiff - hours} h` : '')
  } else return `+ ${hoursDiff} h`
}
