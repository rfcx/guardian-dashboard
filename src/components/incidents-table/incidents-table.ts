import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Event, EventExtended, Incident, Response, ResponseExtended } from '@/types'
import { formatDateTimeLabel, formatDayTimeLabel, formatTimeLabel, getDay, inLast6Hours, isToday, isYesterday, twoDateDiffExcludeHours } from '@/utils'

interface IncidentItem extends Event, Incident, Response {}
interface EventItem {
  value: string
  count: number
}

export default class IncidentsTableRows extends Vue {
  @Prop({ default: null })
  timezone!: string

  @Prop({ default: [] })
  itemsData!: IncidentItem[]

  public dateFormatted (date: string): string {
    return formatDayTimeLabel(date, this.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.timezone)
  }

  public getFirstOrLastItem (items: Event[] | Response[], firstItem: boolean): Response | Event {
    items.sort((a: Response | Event, b: Response | Event) => {
      const dateA = new Date(this.getItemDatetime(a, firstItem)).valueOf()
      const dateB = new Date(this.getItemDatetime(b, firstItem)).valueOf()
      return firstItem ? dateA - dateB : dateB - dateA
    })
    return items[0]
  }

  public getItemDatetime (item: Response | Event, first: boolean): string {
    return (item as Event).start ? (first ? (item as Event).start : (item as Event).end) : (item as Response).submittedAt
  }

  public getEventsTitle (events: Event[]): string | undefined {
    if (this.timezone !== undefined) {
      const start = (this.getFirstOrLastItem(events, true) as Event).start
      const end = (this.getFirstOrLastItem(events, false) as Event).end
      return `${formatDateTimeLabel(start)} - ${formatDateTimeLabel(end)}`
    }
  }

  public getEventsLabel (events: Event[]): string | undefined {
    if (this.timezone !== undefined) {
      const start = (this.getFirstOrLastItem(events, true) as Event).start
      const end = (this.getFirstOrLastItem(events, false) as Event).end
      // today - today => Today, X-Y
      if ((Boolean(isToday(start, this.timezone))) && isToday(end, this.timezone)) {
        return `Today, ${formatTimeLabel(start)} - ${formatTimeLabel(end)}`
      }
      // yesterday - today => Yesterday X - Today Y
      if (isYesterday(start, this.timezone) && isToday(end, this.timezone)) {
        return `Yesterday ${formatTimeLabel(start)} - Today ${formatTimeLabel(end)}`
      }
      // yesterday - yesterday => Yesterday X-Y
      if (isYesterday(start, this.timezone) && isYesterday(end, this.timezone)) {
        return `Yesterday, ${formatTimeLabel(start)} - ${formatTimeLabel(end)}`
      }
      // other - today => 10 Dec - Today, Y
      if (isToday(end, this.timezone)) {
        return `${getDay(start, this.timezone)} - Today, ${formatTimeLabel(end)}`
      }
      // other - yesterday => 10 Dec - Yesterday, Y
      if (isYesterday(end, this.timezone)) {
        return `${getDay(start, this.timezone)} - Yesterday, ${formatTimeLabel(end)}`
      }
      // other
      if (getDay(start, this.timezone) === getDay(end, this.timezone)) {
        return `${getDay(start, this.timezone)}`
      } else return `${getDay(start, this.timezone)} - ${getDay(end, this.timezone)}`
    }
  }

  public getResponseTitle (responses: Response[]): string | undefined {
    if (this.timezone !== undefined) {
      const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
      return formatDateTimeLabel(firstResponse)
    }
  }

  public getResponseLabel (responses: Response[]): string | undefined {
    if (this.timezone !== undefined) {
      const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
      // today => Today, X
      if (isToday(firstResponse, this.timezone)) {
        return `Today, ${formatTimeLabel(firstResponse)}}`
      }
      // yesterday => Yesterday, X
      if (isYesterday(firstResponse, this.timezone)) {
        return `Yesterday, ${formatTimeLabel(firstResponse)}}`
      } else return `${getDay(firstResponse, this.timezone)}`
    }
  }

  public getResponseTime (incident: IncidentItem): string | undefined {
    if (this.timezone !== undefined) {
      if (incident.responses.length > 0 && incident.events.length > 0) {
        return `${(twoDateDiffExcludeHours((this.getFirstOrLastItem((incident.events as EventExtended[]), true) as Event).start, (this.getFirstOrLastItem((incident.responses as ResponseExtended[]), true) as Response).submittedAt, true) as string)}`
      }
      return '-'
    }
  }

  public getEventsCount (events: Event[]): EventItem[] {
    // eslint-disable-next-line prefer-const
    let rows: any = {}
    events.forEach((e: Event) => {
      if (rows[e.classification.value] === undefined) {
        rows[e.classification.value] = {
          value: e.classification.value,
          count: 1
        }
      } else {
        rows[e.classification.value].count++
      }
    })
    return Object.values(rows)
  }

  public getFirstTagLabel (incident: IncidentItem): string | undefined {
    if (incident.closedAt) return 'Closed'
    else return 'Open'
  }

  public checkRecentLabel (events: Event[]): boolean {
    return inLast6Hours((this.getFirstOrLastItem(events, false) as Event).start)
  }
}
