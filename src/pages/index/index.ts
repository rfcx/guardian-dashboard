import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import IncidentsTableRows from '@/components/incidents-table/incidents-table.vue'
import InvalidPageStateComponent from '@/components/invalid-page-state/invalid-page-state.vue'
import PaginationComponent from '@/components/pagination/pagination.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Auth0Option, Incident, Pagination, Stream } from '@/types'

@Options({
  components: {
    IncidentsTableRows,
    InvalidPageStateComponent,
    PaginationComponent
  }
})
export default class IndexPage extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

  public incidents: Incident[] | undefined
  public isDataValid = true
  public isLoading = false
  public isPaginationAvailable = false
  public stream?: Stream

  public paginationSettings: Pagination = {
    total: 0,
    limit: 10,
    offset: 0,
    page: 1
  }

  data (): Record<string, unknown> {
    return {
      incidents: this.incidents,
      stream: this.stream
    }
  }

  @Watch('$route.params')
  onRouteParamsChange (): void {
    this.resetPaginationData()
    this.isDataValid = true
    if (!this.getStreamIdFromRouterParams()) return
    this.isLoading = true
    void this.onUpdatePage()
  }

  async created (): Promise<void> {
    if (!this.getStreamIdFromRouterParams()) return
    this.isDataValid = true
    await this.onUpdatePage()
    if ((this.incidents && !this.incidents.length) ?? !this.stream) {
      this.isDataValid = false
    }
  }

  public async getIncidentsData (): Promise<void> {
    try {
      const resp = await IncidentsService.getIncidents({
        streams: [this.getStreamIdFromRouterParams()],
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

  async onUpdatePage (): Promise<void> {
    await this.getStreamData()
    await this.getIncidentsData()
  }

  public getStreamIdFromRouterParams (): string {
    const streamId: string = this.$route.params.streamId as string
    return streamId
  }

  public resetPaginationData (): void {
    this.paginationSettings = {
      total: 0,
      limit: 10,
      offset: 0,
      page: 1
    }
  }

  public getStreamName (): string | undefined {
    return this.stream?.name
  }

  public getStreamTimezone (): string | undefined {
    return this.stream?.timezone
  }

  public async getStreamData (): Promise<void> {
    this.isLoading = true
    return await StreamService.getStreams({
      streams: [this.getStreamIdFromRouterParams()],
      include_closed_incidents: true
    }).then(res => {
      this.stream = res.data.find(stream => { return stream.id === this.getStreamIdFromRouterParams() })
    }).catch(e => {
      console.error('Error getting streams data', e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  public async getPage (): Promise<void> {
    this.isLoading = true
    await this.getIncidentsData()
  }
}
