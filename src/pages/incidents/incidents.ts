import Mapbox from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Watch } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import IncidentsTableRows from '@/components/incidents-table/incidents-table.vue'
import InvalidPageStateComponent from '@/components/invalid-page-state/invalid-page-state.vue'
import MapComponent from '@/components/map/map.vue'
import PaginationComponent from '@/components/pagination/pagination.vue'
import { StreamService, VuexService } from '@/services'
import { Auth0Option, IncidentStatus, MapboxOptionsWTitle, Pagination, Project, Stream } from '@/types'

interface statusOptions {
  include_closed_incidents?: boolean
  has_hot_incident?: boolean
  has_new_events?: boolean
}

@Options({
  components: {
    IncidentsTableRows,
    InvalidPageStateComponent,
    MapComponent,
    OnClickOutside,
    PaginationComponent
  }
})
export default class IncidentsPage extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

  @VuexService.Projects.projects.bind()
  public projects!: Project[]

  public selectedProject: Project | undefined

  public isLoading = true
  public errorMessage?: string | null
  public isPaginationAvailable = false
  public isDataValid = true
  public statusSelected = false
  public streamsData: Stream[] | undefined
  public showMap: boolean = false
  public mapData: MapboxOptionsWTitle | undefined
  public incidentsStatus: IncidentStatus[] = [
    { value: 'any', label: 'Any', checked: true },
    { value: 'recent', label: 'Recent', checked: false },
    { value: 'hot', label: 'Hot', checked: false }
  ]

  public includeClosedIncidents: IncidentStatus = { value: 'closed', label: 'Include closed incidents', checked: false }

  public limit = 2
  public searchLabel = ''
  public paginationSettings: Pagination = {
    total: 0,
    limit: 8,
    offset: 0,
    page: 1
  }

  private timerSub!: ReturnType<typeof setTimeout>

  data (): Record<string, unknown> {
    return {
      incidentsStatus: this.incidentsStatus,
      streamsData: this.streamsData,
      errorMessage: this.errorMessage,
      t: useI18n()
    }
  }

  @Watch('$route.params')
  onRouteParamsChange (): void {
    this.isDataValid = true
    this.getSelectedProject()
    void this.onUpdatePage()
  }

  mounted (): void {
    this.getSelectedProject()
  }

  async onUpdatePage (): Promise<void> {
    this.resetPaginationData()
    await this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  async created (): Promise<void> {
    if (!this.auth?.isAuthenticated) {
      return
    }
    await this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
    this.getSelectedProject()
    if (this.selectedProject === undefined && this.getProjectIdFromRouterParams() !== undefined) {
      this.isDataValid = false
    }
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
      limit: 8,
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

  public toggleStatusMenu (): void {
    this.statusSelected = !this.statusSelected
  }

  public toggleStatus (status: IncidentStatus): void {
    this.incidentsStatus.forEach((s: IncidentStatus) => { s.checked = false })
    status.checked = true
    void this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public showGuardianMap (stream: Stream): void {
    if (stream.latitude !== undefined && stream.longitude !== undefined) {
      this.mapData = {
        center: new Mapbox.LngLat(stream.longitude, stream.latitude),
        zoom: 12,
        title: stream.name
      }
      this.showMap = true
    }
  }

  public closeGuardianMap (): void {
    this.showMap = false
    this.mapData = undefined
  }

  public async getStreamsData (projectId?: string, status?: string): Promise<void> {
    this.errorMessage = null
    this.isLoading = true
    return await StreamService.getStreams({
      ...projectId !== undefined && { projects: [projectId] },
      ...status !== undefined && this.optionsForStatus(status),
      include_closed_incidents: this.includeClosedIncidents.checked ? true : undefined,
      limit: this.paginationSettings.limit,
      offset: this.paginationSettings.offset * this.paginationSettings.limit,
      keyword: this.searchLabel,
      limit_incidents: 3
    }).then(res => {
      this.streamsData = res.data
      this.paginationSettings.total = res.headers['total-items']
      this.isPaginationAvailable = (this.paginationSettings.total / this.paginationSettings.limit) > 1
    }).catch(e => {
      console.error('Error getting streams with incidents', e)
      this.errorMessage = 'Error getting streams with incidents'
    }).finally(() => {
      this.isLoading = false
    })
  }

  public async getPage (): Promise<void> {
    await this.getStreamsData(this.getProjectIdFromRouterParams(), this.getSelectedValue())
  }

  public optionsForStatus (status: string): statusOptions | undefined {
    if (status === 'hot') return { has_hot_incident: true }
    else if (status === 'recent') return { has_new_events: true }
  }
}
