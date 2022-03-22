import { Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
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

  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }

  mounted (): void {
    this.combineItemsTitles(this.items)
  }

  public combineItemsTitles (items: IncidentItem[]): void {
    items.forEach((incident: IncidentItem) => {
      incident.eventsTitle = incident.events.length ? this.getEventsTitle(incident.events) : ''
      incident.eventsLabel = incident.events.length ? this.getEventsLabel(incident.events) : ''
      incident.responseTitle = this.getResponseTitle(incident)
      incident.responseLabel = this.getResponseLabel(incident)
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
    return `${formatDateTime(start, this.timezone)} - ${formatDateTime(end, this.timezone)}`
  }

  public getIconTitle (count: number, value: string): string {
    return `${count} ${this.$t(value)} ${count > 1 ? this.$t('events') : this.$t('event')}`
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

  public getResponseTitle (incident: IncidentItem): string {
    if (!incident.responses.length) return '-'
    const firstResponse = this.getFirstResponse(incident.responses, incident.firstResponseId)
    if (!firstResponse) return '-'
    return formatDateTime(firstResponse.submittedAt, this.timezone)
  }

  public getResponseLabel (incident: IncidentItem): string {
    if (!incident.responses.length) return '-'
    const firstResponse = this.getFirstResponse(incident.responses, incident.firstResponseId)
    if (!firstResponse) return '-'
    if (isDateToday(firstResponse.submittedAt, this.timezone)) {
      return `Today, ${formatTime(firstResponse.submittedAt, this.timezone)}`
    }
    if (isDateYesterday(firstResponse.submittedAt, this.timezone)) {
      return `Yesterday, ${formatTime(firstResponse.submittedAt, this.timezone)}`
    } else return `${getDayAndMonth(firstResponse.submittedAt, this.timezone)}`
  }

  public getFirstResponse (responses: Response[], firstResponseId: string): Response | undefined {
    return responses.find(response => response.id === firstResponseId)
  }

  public getResponseTime (incident: IncidentItem): string {
    if (!incident.responses.length || !incident.events.length) return '-'
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
