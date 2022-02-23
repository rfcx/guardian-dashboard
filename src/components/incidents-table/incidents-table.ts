import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { Event as Ev, EventExtended, Incident, Response, ResponseExtended } from '@/types'
import { formatDateTime, formatDateTimeRange, formatDateTimeWithoutYear, formatTime, getDayAndMonth, isDateToday, isDateYesterday, twoDateDiffExcludeHours } from '@/utils'
import icons from '../../assets/index'

interface IncidentItem extends Ev, Incident, Response {
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

  @Watch('items')
  onItemsChange (): void {
    this.combineItemsTitles(this.items)
  }

  mounted (): void {
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
    return formatDateTimeWithoutYear(date, this.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTime(date, this.timezone)
  }

  public getFirstOrLastItem (items: Response[] | Ev[], firstItem: boolean): Response | Ev {
    items.sort((a: Response | Ev, b: Response | Ev) => {
      const dateA = new Date(this.getItemDatetime(a, firstItem)).valueOf()
      const dateB = new Date(this.getItemDatetime(b, firstItem)).valueOf()
      return firstItem ? dateA - dateB : dateB - dateA
    })
    return items[0]
  }

  public getItemDatetime (item: Response | Ev, first: boolean): string {
    const itemIsEvent = (item as Ev).start !== undefined
    return itemIsEvent ? (first ? (item as Ev).start : (item as Ev).end) : (item as Response).submittedAt
  }

  public getEventsTitle (events: Ev[]): string {
    const start = (this.getFirstOrLastItem(events, true) as Ev).start
    const end = (this.getFirstOrLastItem(events, false) as Ev).end
    return `${formatDateTime(start)} - ${formatDateTime(end)}`
  }

  public getIconTitle (count: number, value: string): string {
    return `${count} ${value} ${count > 1 ? 'events' : 'event'}`
  }

  public getEventsLabel (events: Ev[]): string {
    const start = (this.getFirstOrLastItem(events, true) as Ev).start
    const end = (this.getFirstOrLastItem(events, false) as Ev).end
    return formatDateTimeRange(start, end, this.timezone)
  }

  public setDefaultReportImg (e: Event): void {
    if ((e?.target as HTMLImageElement) !== undefined) {
      (e.target as HTMLImageElement).src = icons.reportIcon
    }
  }

  public getResponseTitle (responses: Response[]): string {
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    return formatDateTime(firstResponse)
  }

  public getResponseLabel (responses: Response[]): string {
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    // today => Today, X
    if (isDateToday(firstResponse, this.timezone)) {
      return `Today, ${formatTime(firstResponse, this.timezone)}`
    }
    // yesterday => Yesterday, X
    if (isDateYesterday(firstResponse, this.timezone)) {
      return `Yesterday, ${formatTime(firstResponse, this.timezone)}`
    } else return `${getDayAndMonth(firstResponse, this.timezone)}`
  }

  public getResponseTime (incident: IncidentItem): string | undefined {
    if (this.timezone === undefined) {
      return undefined
    }
    if (incident.responses.length === 0 || incident.events.length === 0) {
      return '-'
    }
    return `${(twoDateDiffExcludeHours((this.getFirstOrLastItem((incident.events as EventExtended[]), true) as Ev).start, (this.getFirstOrLastItem((incident.responses as ResponseExtended[]), true) as Response).submittedAt, true) as string)}`
  }

  public getEventsCount (events: Ev[]): EventItem[] {
    const rows: Record<string, EventItem> = {}
    events.forEach((e: Ev) => {
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
}
