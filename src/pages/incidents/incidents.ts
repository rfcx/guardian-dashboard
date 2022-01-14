import { Options, Vue } from 'vue-class-component'

import IncidentsTableRows from '@/components/incidents-table/incidents-table.vue'
import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import PaginationComponent from '@/components/pagination/pagination.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Incident, IncidentStatus, Pagination, Project, Stream } from '@/types'
// import { getLast6HoursLabel } from '@/utils'

interface statusOptions {
  incidents_closed?: boolean
  incidents_min_events?: number
  // first_event_start?: string
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
  public streamsData: Stream[] | undefined
  public incidentsStatus: IncidentStatus[] = [
    { value: 'any', label: 'Any', checked: true },
    { value: 'open', label: 'Open', checked: false },
    { value: 'closed', label: 'Closed', checked: false },
    // { value: 'recent', label: 'Recent', checked: false },
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
      incidentsStatus: this.incidentsStatus,
      streamsData: this.streamsData
    }
  }

  updated (): void {
    if (this.selectedProject !== undefined && this.selectedProject.id !== this.$route.params.projectId) {
      this.resetPaginationData()
      void this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
      this.getSelectedProject()
    }
  }

  mounted (): void {
    this.getSelectedProject()
  }

  async created (): Promise<void> {
    await this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public isProjectAccessed (): boolean {
    return this.selectedProject !== undefined
  }

  public getProjectIdFromRouterParams (): string {
    const projectId: string = this.$route.params.projectId as string
    return projectId
  }

  public getSelectedProject (): void {
    this.selectedProject = this.projects?.find(p => p.id === this.$route.params.projectId)
  }

  public resetPaginationData (): void {
    this.paginationSettings = {
      total: 0,
      limit: 10,
      offset: 0,
      page: 1
    }
  }

  public getStreamById (streamId: string): Stream | undefined {
    const stream = this.streamsData?.find(s => s.id === streamId)
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
        void this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
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
    void this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public async getStreamsData (projectId: string, status?: string): Promise<void> {
    this.isLoading = true
    return await StreamService.getStreams({
      projects: [projectId],
      ...status !== undefined && this.optionsForStatus(status),
      limit: this.paginationSettings.limit,
      offset: this.paginationSettings.offset * this.paginationSettings.limit,
      keyword: this.searchLabel,
      limit_incidents: 3
    }).then(res => {
      this.streamsData = res.data
      this.paginationSettings.total = res.headers['total-items']
      this.isPaginationAvailable = (this.paginationSettings.total / this.paginationSettings.limit) > 1
    }).catch(e => {
      console.error('Error loading streams with incidents', e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  public async getPage (): Promise<void> {
    await this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public optionsForStatus (status: string): statusOptions | undefined {
    if (status === 'closed') return { incidents_closed: true }
    else if (status === 'open') return { incidents_closed: false }
    else if (status === 'hot') return { incidents_min_events: 11 }
    // TODO: Add first_event_start parameter to the endpoint
    // else if (status === 'recent') return { first_event_start: getLast6HoursLabel() }
  }

  public formatIncidents (incidents: Incident[]): Incident[] {
    return incidents.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
  }
}
