import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

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

export const formatDateTimeLabel = (label: string, timezone?: string): string => {
  if (timezone !== undefined) return dayjs(label).tz(timezone).format('MMM DD, YYYY HH:mm')
  else return dayjs(label).format('MMM DD, YYYY HH:mm')
}

export const formatDiffFromNow = (label: string, timezone?: string): any => {
  if (timezone !== undefined) {
    const dateDiff = dayjs.duration(dayjs().tz(timezone).diff(dayjs(label).tz(timezone)))
    return combineLabel(dateDiff)
  } else return combineLabel(dayjs.duration(dayjs().diff(dayjs(label))))
}

export const inLast24Hours = (label: string): boolean => {
  const dateDiff = dayjs.duration(dayjs().diff(dayjs(label)))
  const data: any = Object.values(dateDiff)[0]
  return data.days < 1
}

export const formatTwoDateDiff = (labelFrom: string, labelTo: string): any => {
  const dateDiff = dayjs.duration(dayjs(labelTo).diff(dayjs(labelFrom)))
  return combineLabel(dateDiff)
}

function combineLabel (dateDiff: duration.Duration): string {
  let string = ''
  const data: any = Object.values(dateDiff)[0]
  dataArray.forEach((item: string) => {
    if (data[item] !== 0) {
      if (item === 'seconds' && (data.minutes !== 0 && data.hours !== 0)) return string
      else string += ` ${(data[item] as string)} ${getEndLabel(data[item], item)}`
    }
  })
  return string
}

function getEndLabel (count: number, item: string): string {
  if (count === 1) return item.substring(0, (item.length - 1))
  return item
}

export const formatDayTimeLabel = (label: string | any, timezone?: string): string => {
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

export const getUtcTimeValueOf = (label: string): number => {
  return dayjs.utc(label).valueOf()
}
