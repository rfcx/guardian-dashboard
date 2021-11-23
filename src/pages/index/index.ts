import { Options, Vue } from 'vue-class-component'

import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Auth0Option, Event, EventExtended, Incident, Pagination, Project, ResponseExtended, Stream } from '@/types'
import { formatDiffFromNow, getUtcTimeValueOf } from '@/utils'
import PaginationComponent from '../../components/pagination/pagination.vue'

@Options({
  components: {
    InvalidProjectComponent,
    NavigationBarComponent,
    PaginationComponent
  }
})
export default class IndexPage extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

  public incidents: Incident[] | undefined
  public errorMessage: string | undefined
  public streamsData: Stream[] = []
  public selectedProject: Project | undefined
  public isLoading = false
  public isPaginationAvailable = false
  public paginationSettings: Pagination = {
    total: 0,
    limit: 10,
    offset: 0,
    page: 1
  }

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
    this.errorMessage = ''
    try {
      const resp = await IncidentsService.getIncidents({
        limit: this.paginationSettings.limit,
        offset: this.paginationSettings.offset * this.paginationSettings.limit
      })
      this.paginationSettings.total = resp.headers['total-items']
      this.isPaginationAvailable = (this.paginationSettings.total / this.paginationSettings.limit) > 1
      const incidentsData: Incident[] = resp.data
      this.incidents = incidentsData
      this.isLoading = false
      for (const item of this.incidents) {
        void IncidentsService.combineIncidentItems(item)
      }
    } catch (e) {
      this.isLoading = false
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
    return incident.events.filter(e => getUtcTimeValueOf(e.start) > maxTime)
  }

  public getItemDatetime (item: ResponseExtended | EventExtended | Event): string {
    if ((item as Event).start) {
      return (item as Event).start
    }
    return (item as EventExtended).type === 'event' ? (item as EventExtended).start : (item as ResponseExtended).submittedAt
  }

  public sortItems (items: Array<ResponseExtended | EventExtended | Event>): void {
    items.sort((a: ResponseExtended | EventExtended | Event, b: ResponseExtended | EventExtended | Event) => {
      const dateA = new Date(this.getItemDatetime(a)).valueOf()
      const dateB = new Date(this.getItemDatetime(b)).valueOf()
      return dateB - dateA
    })
  }

  public getEventsLabel (events: Event[], timezone: string): string {
    this.sortItems(events)
    return events.length ? `${this.formatDiffFromNow(events[events.length - 1].start, timezone)} no response` : ''
  }

  public getResponsesLabel (incident: Incident, timezone: string): string {
    return `last response was ${this.formatDiffFromNow(incident.items[0].createdAt, timezone)} ago`
  }

  public getClosedLabel (closedAt: string, timezone: string): string {
    return `report closed ${this.formatDiffFromNow(closedAt, timezone)} ago`
  }
}
