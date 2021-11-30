import { Options, Vue } from 'vue-class-component'

import IncidentsTableRows from '@/components/incidents-table/incidents-table.vue'
import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import PaginationComponent from '@/components/pagination/pagination.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Event, Incident, Pagination, Project, Response, Stream } from '@/types'
import { formatDayTimeLabel, formatDayWithoutTime, formatDiffFromNow, formatTwoDateDiff } from '@/utils'

@Options({
  components: {
    IncidentsTableRows,
    InvalidProjectComponent,
    PaginationComponent
  }
})
export default class IncidentsPage extends Vue {
  @VuexService.Projects.projects.bind()
  projects!: Project[]

  public selectedProject: Project | undefined
  public isLoading = false
  public isPaginationAvailable = false
  public incidents: Incident[] = []
  public streamsData: Stream[] = []

  public isOpenedIncidents: string | string[] | undefined
  public limit = 2
  public alertsLabel = ''
  public paginationSettings: Pagination = {
    total: 0,
    limit: 10,
    offset: 0,
    page: 1
  }

  updated (): void {
    if (this.selectedProject !== undefined && this.selectedProject.id !== this.$route.params.projectId) {
      this.getSelectedProject()
      this.getData()
    }
    const temp = this.isOpenedIncidents
    if (this.$route.params.isOpenedIncidents !== undefined && temp !== this.$route.params.isOpenedIncidents) {
      this.isOpenedIncidents = this.$route.params.isOpenedIncidents
      this.resetPaginationData()
      this.getData(this.$route.params.isOpenedIncidents === 'false')
    }
  }

  mounted (): void {
    this.getSelectedProject()
    const params: string = this.$route.params.projectId as string
    void this.getStreamsData(params)
    void this.getIncidentsData(params)
  }

  public getData (isOpenedIncidents?: boolean): void {
    const params: string = this.$route.params.projectId as string
    void this.getStreamsData(params)
    void this.getIncidentsData(params, isOpenedIncidents)
  }

  public resetPaginationData (): void {
    this.paginationSettings = {
      total: 0,
      limit: 10,
      offset: 0,
      page: 1
    }
  }

  public getSelectedProject (): void {
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
  }

  public getStreamById (streamId: string): Stream | undefined {
    const stream = this.streamsData.find(s => s.id === streamId)
    return stream
  }

  public getStreamName (streamId: string): string | null {
    const stream: Stream | undefined = this.getStreamById(streamId)
    return stream !== undefined ? stream.name : null
  }

  public getStreamTimezone (streamId: string): string | undefined {
    const stream: Stream | undefined = this.getStreamById(streamId)
    if (stream !== undefined) {
      return stream.timezone
    }
  }

  public getIncidentStatus (incident: Incident): string {
    const timezone = this.getStreamTimezone(incident.streamId)
    let status = ''
    if (timezone !== undefined) {
      if (incident.closedAt !== null && incident.closedAt !== undefined) {
        status = `incident closed ${(formatDiffFromNow(incident.closedAt, timezone) as string)} ago`
      } else if (incident.responses.length > 0) {
        if (incident.events.length > 0) {
          status = `response time ${(formatTwoDateDiff((this.getFirstItem(incident.events) as Event).start, (this.getFirstItem(incident.responses) as Response).submittedAt) as string)}`
        } else {
          status = `investigated without events at ${formatDayTimeLabel((this.getFirstItem(incident.responses) as Response).investigatedAt, timezone)}`
        }
      } else if (!incident.items.length) {
        return 'no events and responses'
      } else {
        status = `${(formatDiffFromNow((this.getFirstItem(incident.events) as Event).start, timezone) as string)} without response`
      }
    }
    return status
  }

  public getFirstItem (items: Response[] | Event[]): Response | Event {
    items.sort((a: Response | Event, b: Response | Event) => {
      const dateA = new Date(this.getItemDatetime(a)).valueOf()
      const dateB = new Date(this.getItemDatetime(b)).valueOf()
      return dateA - dateB
    })
    return items[0]
  }

  public getItemDatetime (item: Response | Event): string {
    return (item as Event).start ? (item as Event).start : (item as Response).submittedAt
  }

  public itemsLabel (incident: Incident): string {
    const timezone = this.getStreamTimezone(incident.streamId)
    const items = incident.items.slice(4)
    const eventsCount = items.filter((i) => i.type === 'event').length
    const responsesCount = items.filter((i) => i.type === 'response').length
    let str = ''
    if (eventsCount > 0) {
      str += `${eventsCount} events `
      if (responsesCount > 0) {
        str += 'and '
      }
    }
    if (responsesCount > 0) {
      str += `${responsesCount} responses `
    }
    str += `since ${formatDayWithoutTime(incident.createdAt, timezone)}`
    return str
  }

  public async getStreamsData (projectId: string): Promise<void> {
    this.streamsData = await StreamService.getStreams([projectId])
    await VuexService.Projects.streams.set(this.streamsData)
  }

  public async getPage (): Promise<void> {
    if (this.$route.params.isOpenedIncidents !== undefined) {
      await this.getIncidentsData(this.$route.params.projectId, this.$route.params.isOpenedIncidents === 'false')
    } else await this.getIncidentsData(this.$route.params.projectId)
  }

  public async getIncidentsData (projectId: string | string[], closed?: boolean): Promise<void> {
    if (this.isLoading) return
    this.isLoading = true
    try {
      const data = await IncidentsService.getIncidents({
        projects: projectId,
        limit: this.paginationSettings.limit,
        offset: this.paginationSettings.offset * this.paginationSettings.limit,
        ...closed !== undefined && { closed: closed }
      })
      this.paginationSettings.total = data.headers['total-items']
      this.isPaginationAvailable = (this.paginationSettings.total / this.paginationSettings.limit) > 1
      this.incidents = this.formatIncidents(data.data)
      this.isLoading = false
    } catch (e) {
      this.isLoading = false
    }
  }

  public formatIncidents (incidents: Incident[]): Incident[] {
    return incidents.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
  }
}
