import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Auth0Option, Event, EventExtended, Incident, Project, ResponseExtended, Stream } from '@/types'
import { formatDiffFromNow, getUtcTimeValueOf } from '@/utils'

@Options({
  components: { NavigationBarComponent }
})
export default class IndexPage extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

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
    if (this.$route.params.projectId === undefined && this.auth?.isAuthenticated) {
      this.isLoading = true
      void this.getIncidentsData()
      void this.getStreamsData()
    }
  }

  public formatDiffFromNow (date: string, timezone: string): string {
    return formatDiffFromNow(date, timezone)
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
    const resp = await IncidentsService.getIncidents()
    const incidentsData: Incident[] = resp.data
    this.incidents = incidentsData
    this.isLoading = false
    for (const item of this.incidents) {
      void IncidentsService.combineIncidentItems(item)
    }
  }

  public getEventsCount (incident: Incident): number {
    return this.getLastEvents(incident).length
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
    const temp: number[] = incident.responses.map(r => { return getUtcTimeValueOf(r.submittedAt) })
    const maxTime: number = Math.max(...temp)
    return incident.events.filter(e => getUtcTimeValueOf(e.createdAt) > maxTime)
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
    return events.length ? `${this.formatDiffFromNow(events[0].createdAt, timezone)} no response` : ''
  }

  public getResponsesLabel (incident: Incident, timezone: string): string {
    return `last response was ${this.formatDiffFromNow(incident.items[0].createdAt, timezone)} ago`
  }
}
