import { Options, Vue } from 'vue-class-component'

import IncidentsTableRows from '@/components/incidents-table/incidents-table.vue'
import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import PaginationComponent from '@/components/pagination/pagination.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Incident, IncidentStatus, Pagination, Project, Stream } from '@/types'
import { getLast6HoursLabel } from '@/utils'

interface statusOptions {
  closed?: boolean
  min_events?: number
  first_event_start?: string
}

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
  public isLoading = true
  public isPaginationAvailable = false
  public incidents: Incident[] = []
  public streamsData: Stream[] = []
  public incidentsStatus: IncidentStatus[] = [
    { value: 'any', label: 'Any', checked: true },
    { value: 'open', label: 'Open', checked: false },
    { value: 'closed', label: 'Closed', checked: false },
    { value: 'new', label: 'New', checked: false },
    { value: 'hot', label: 'Hot', checked: false }
  ]

  public limit = 2
  public statusSelected = false
  public alertsLabel = ''
  public searchLabel = ''
  public paginationSettings: Pagination = {
    total: 0,
    limit: 10,
    offset: 0,
    page: 1
  }

  private timerSub!: ReturnType<typeof setTimeout>

  data (): Record<string, unknown> {
    return {
      incidentsStatus: this.incidentsStatus
    }
  }

  updated (): void {
    if (this.selectedProject !== undefined && this.selectedProject.id !== this.$route.params.projectId) {
      this.getData()
    }
  }

  mounted (): void {
    this.getData()
  }

  public isProjectAccessed (): boolean {
    return this.selectedProject !== undefined
  }

  public getProjectIdFromRouterParams (): string {
    const projectId: string = this.$route.params.projectId as string
    return projectId
  }

  public getData (): void {
    this.isLoading = true
    this.selectedProject = this.projects.find(p => p.id === this.getProjectIdFromRouterParams())
    void this.getStreamsData(this.getProjectIdFromRouterParams())
      .then(() => {
        void this.getIncidentsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
      })
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
    this.isLoading = true
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
    this.isLoading = false
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

  public searchStream (): void {
    if (this.timerSub !== undefined) {
      clearTimeout(this.timerSub)
    }
    this.timerSub = setTimeout(() => {
      if (!this.searchLabel.length || (this.searchLabel.length && this.searchLabel.length >= 3 && this.streamsData !== undefined)) {
        this.getData()
      }
    }, 1500)
  }

  public getSelectedStatus (): string | undefined {
    const s = this.incidentsStatus.find(s => s.checked)
    return s?.label
  }

  public getSelectedValue (): string | undefined {
    const s = this.incidentsStatus.find(s => s.checked)
    return s?.value
  }

  public toggleStatusFilter (): void {
    this.statusSelected = !this.statusSelected
  }

  public toggleStatus (status: IncidentStatus): void {
    this.incidentsStatus.forEach((s: IncidentStatus) => { s.checked = false })
    status.checked = true
    void this.getIncidentsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public async getStreamsData (projectId: string): Promise<void> {
    // TODO: Fix pagination total-items data.
    // limit: this.paginationSettings.limit,
    // offset: this.paginationSettings.offset * this.paginationSettings.limit,
    const streamsData = await StreamService.getStreams([projectId], this.searchLabel)
    this.streamsData = streamsData.data
    await VuexService.Projects.streams.set(this.streamsData)
    console.log(streamsData)
    this.paginationSettings.total = streamsData.headers['total-items']
    this.isPaginationAvailable = (this.paginationSettings.total / this.paginationSettings.limit) > 1
    this.isLoading = false
  }

  public async getPage (): Promise<void> {
    await this.getIncidentsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public async getIncidentsData (projectId: string, status?: string): Promise<void> {
    try {
      for (const stream of this.streamsData) {
        stream.loading = true
        const data = await IncidentsService.getIncidents({
          projects: [projectId],
          streams: [stream.id],
          limit: this.paginationSettings.limit,
          offset: this.paginationSettings.offset * this.paginationSettings.limit,
          ...status !== undefined && this.optionsForStatus(status)
        })
        stream.incidents = this.formatIncidents(data.data)
        stream.loading = false
      }
    } catch (e) {}
  }

  public optionsForStatus (status: string): statusOptions | undefined {
    if (status === 'closed') return { closed: true }
    else if (status === 'open') return { closed: false }
    else if (status === 'hot') return { min_events: 11 }
    else if (status === 'new') return { first_event_start: getLast6HoursLabel() }
  }

  public formatIncidents (incidents: Incident[]): Incident[] {
    return incidents.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
  }
}
