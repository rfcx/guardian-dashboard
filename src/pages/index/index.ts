import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { IncidentsService, StreamService } from '@/services'
import { Event, EventExtended, Incident, Project, ResponseExtended, Stream } from '@/types'
import { formatDifferentFromNow } from '@/utils'

@Options({
  components: { NavigationBarComponent }
})
export default class IndexPage extends Vue {
  public incidents: Incident[] | undefined
  public streamsData: Stream[] = []
  public selectedProject: Project | undefined
  public isLoading = false

  data (): Record<string, unknown> {
    return {
      incidents: this.incidents,
      selectedProject: this.selectedProject
    }
  }

  mounted (): void {
    this.isLoading = true
    if (this.$route.params.projectId === undefined) {
      void this.getIncidentsData()
      void this.getStreamsData()
    }
  }

  public formatDifferentFromNow (date: string, timezone: string): string {
    return formatDifferentFromNow(date, timezone)
  }

  public async getStreamsData (): Promise<void> {
    this.streamsData = await StreamService.getStreams()
  }

  public getStreamName (streamId: string): string | null {
    const stream: Stream | undefined = this.getStreamById(streamId)
    return stream !== undefined ? stream.name : null
  }

  public getProjectName (streamId: string): string | null | undefined {
    const stream: Stream | undefined = this.getStreamById(streamId)
    return stream !== undefined ? stream.project?.name : null
  }

  public getProjectId (streamId: string): string | null | undefined {
    const stream: Stream | undefined = this.getStreamById(streamId)
    return stream !== undefined ? stream.project?.id : null
  }

  public getStreamTimezone (streamId: string): string | undefined {
    const stream: Stream | undefined = this.getStreamById(streamId)
    if (stream !== undefined) {
      return stream.timezone
    }
  }

  public getStreamById (streamId: string): Stream | undefined {
    const stream = this.streamsData.find(s => s.id === streamId)
    return stream
  }

  public async getIncidentsData (): Promise<void> {
    const incidentsData: Incident[] = await IncidentsService.getIncidents()
    this.incidents = incidentsData
    this.isLoading = false
    for (const item of this.incidents) {
      void IncidentsService.combineIncidentItems(item)
    }
  }

  public getEventsCount (incident: Incident): number {
    let eventsCount = 0
    if (incident.events.length && incident.responses.length) {
      const events = this.filterEvents(incident)
      eventsCount += events.length
    }
    if (incident.events.length && !incident.responses.length) {
      eventsCount += incident.events.length
    }
    return eventsCount
  }

  public getLastEvents (incident: Incident): Event[] {
    let lastEvents: Event[] = []
    if (incident.events.length && incident.responses.length) {
      const events = this.filterEvents(incident)
      lastEvents = events
    }
    if (incident.events.length && !incident.responses.length) {
      lastEvents = incident.events
    }
    lastEvents.length ?? this.sortItems(lastEvents)
    return lastEvents
  }

  public filterEvents (incident: Incident): Event[] {
    const lastResponse = incident.responses[incident.responses.length - 1]
    return incident.events.filter(e => e.createdAt > lastResponse.createdAt)
  }

  public getItemDatetime (item: ResponseExtended | EventExtended | Event): string {
    if ((item as Event).createdAt) {
      return (item as Event).createdAt
    }
    return (item as EventExtended).type === 'event' ? (item as EventExtended).createdAt : (item as ResponseExtended).submittedAt
  }

  public sortItems (items: Array<ResponseExtended | EventExtended | Event>): void {
    items.sort((a: ResponseExtended | EventExtended | Event, b: ResponseExtended | EventExtended | Event) => {
      const dateA = new Date(this.getItemDatetime(a)).valueOf()
      const dateB = new Date(this.getItemDatetime(b)).valueOf()
      return dateB - dateA
    })
  }

  public getEventsLabel (events: Event[], timezone: string): string {
    return events.length ? `${this.formatDifferentFromNow(events[0].createdAt, timezone)} no response` : ''
  }

  public getResponsesLabel (incident: Incident, timezone: string): string {
    return `last response was ${this.formatDifferentFromNow(incident.items[0].createdAt, timezone)} ago`
  }
}
