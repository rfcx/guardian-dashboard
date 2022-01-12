import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Event, EventExtended, Incident, Response, ResponseExtended } from '@/types'
import { formatDateTimeLabel, formatDateTimeRange, formatDayTimeLabel, formatTimeLabel, getDay, isDateToday, isDateYesterday, twoDateDiffExcludeHours } from '@/utils'
import icons from '../../assets/alert-icons/index'

interface IncidentItem extends Event, Incident, Response {
  eventsTitle: string
  eventsLabel: string
  responseTitle: string
  responseLabel: string
}
interface EventItem {
  value: string
  count: number
}

export default class IncidentsTableRows extends Vue {
  @Prop({ default: null })
  timezone!: string

  @Prop({ default: [] })
  items!: IncidentItem[]

  public itemsData: IncidentItem[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public alertImages!: any

  data (): Record<string, unknown> {
    return {
      alertImages: this.alertImages
    }
  }

  mounted (): void {
    this.alertImages = icons
    this.combineItemsTitles(this.items)
  }

  public combineItemsTitles (items: IncidentItem[]): void {
    items.forEach((incident: IncidentItem) => {
      incident.eventsTitle = incident.events.length ? this.getEventsTitle(incident.events) : ''
      incident.eventsLabel = incident.events.length ? this.getEventsLabel(incident.events) : ''
      incident.responseTitle = incident.responses.length ? this.getResponseTitle(incident.responses) : ''
      incident.responseLabel = incident.responses.length ? this.getResponseLabel(incident.responses) : ''
    })
    this.itemsData = this.items
  }

  public dateFormatted (date: string): string {
    return formatDayTimeLabel(date, this.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.timezone)
  }

  public getFirstOrLastItem (items: Response[] | Event[], firstItem: boolean): Response | Event {
    items.sort((a: Response | Event, b: Response | Event) => {
      const dateA = new Date(this.getItemDatetime(a, firstItem)).valueOf()
      const dateB = new Date(this.getItemDatetime(b, firstItem)).valueOf()
      return firstItem ? dateA - dateB : dateB - dateA
    })
    return items[0]
  }

  public getItemDatetime (item: Response | Event, first: boolean): string {
    const itemIsEvent = (item as Event).start !== undefined
    return itemIsEvent ? (first ? (item as Event).start : (item as Event).end) : (item as Response).submittedAt
  }

  public getEventsTitle (events: Event[]): string {
    const start = (this.getFirstOrLastItem(events, true) as Event).start
    const end = (this.getFirstOrLastItem(events, false) as Event).end
    return `${formatDateTimeLabel(start)} - ${formatDateTimeLabel(end)}`
  }

  public getIconTitle (count: number, value: string): string {
    return `${count} ${value} ${count > 1 ? 'events' : 'event'}`
  }

  public getEventsLabel (events: Event[]): string {
    const start = (this.getFirstOrLastItem(events, true) as Event).start
    const end = (this.getFirstOrLastItem(events, false) as Event).end
    return formatDateTimeRange(start, end, this.timezone)
  }

  public getEventIcon (value: string): string | undefined {
    return this.alertImages[value]
  }

  public getResponseTitle (responses: Response[]): string {
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    return formatDateTimeLabel(firstResponse)
  }

  public getResponseLabel (responses: Response[]): string {
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    // today => Today, X
    if (isDateToday(firstResponse, this.timezone)) {
      return `Today, ${formatTimeLabel(firstResponse, this.timezone)}`
    }
    // yesterday => Yesterday, X
    if (isDateYesterday(firstResponse, this.timezone)) {
      return `Yesterday, ${formatTimeLabel(firstResponse, this.timezone)}`
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

  public checkRecentLabel (events: Event[]): boolean {
    return false
    // inLast6Hours((this.getFirstOrLastItem(events, false) as Event).start)
  }
}
