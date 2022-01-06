import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Event, EventExtended, Incident, Response, ResponseExtended } from '@/types'
import { formatDateTimeLabel, formatDateTimeRange, formatDayTimeLabel, formatTimeLabel, getDay, inLast6Hours, isDateToday, isDateYesterday, twoDateDiffExcludeHours } from '@/utils'

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
    if (this.timezone === undefined) {
      return undefined
    }
    const start = (this.getFirstOrLastItem(events, true) as Event).start
    const end = (this.getFirstOrLastItem(events, false) as Event).end
    return `${formatDateTimeLabel(start)} - ${formatDateTimeLabel(end)}`
  }

  public getEventsLabel (events: Event[]): string | undefined {
    if (this.timezone === undefined) {
      return undefined
    }
    const start = (this.getFirstOrLastItem(events, true) as Event).start
    const end = (this.getFirstOrLastItem(events, false) as Event).end
    return formatDateTimeRange(start, end, this.timezone)
  }

  public getResponseTitle (responses: Response[]): string | undefined {
    if (this.timezone === undefined) {
      return undefined
    }
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    return formatDateTimeLabel(firstResponse)
  }

  public getResponseLabel (responses: Response[]): string | undefined {
    if (this.timezone === undefined) {
      return undefined
    }
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    // today => Today, X
    if (isDateToday(firstResponse, this.timezone)) {
      return `Today, ${formatTimeLabel(firstResponse, this.timezone)}}`
    }
    // yesterday => Yesterday, X
    if (isDateYesterday(firstResponse, this.timezone)) {
      return `Yesterday, ${formatTimeLabel(firstResponse, this.timezone)}}`
    } else return `${getDay(firstResponse, this.timezone)}`
  }

  public getResponseTime (incident: IncidentItem): string | undefined {
    if (this.timezone === undefined) {
      return undefined
    }
    if (incident.responses.length === 0 || incident.events.length === 0) {
      return '-'
    }
    return `${(twoDateDiffExcludeHours((this.getFirstOrLastItem((incident.events as EventExtended[]), true) as Event).start, (this.getFirstOrLastItem((incident.responses as ResponseExtended[]), true) as Response).submittedAt, true) as string)}`
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
