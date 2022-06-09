import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { StreamService, VuexService } from '@/services'
import { Auth0Option, EventType, Stream, StreamStatus } from '@/types'

@Options({
  components: {
    'nav-bar': NavigationBarComponent
  }
})

export default class AnalyticsPage extends Vue {
  @VuexService.Auth.auth.bind()
  public auth!: Auth0Option | undefined

  public isLoading = true
  public streamsData: Stream[] | undefined
  public streamStatus: StreamStatus[] = []
  public streamSelected = false

  public selectedStream: string | undefined
  public typeSelected = false
  public eventType: EventType[] = [
    { type: 'chainsaw', label: 'Chainsaw', checked: true },
    { type: 'vehicle', label: 'Vehicle', checked: false },
    { type: 'gunshot', label: 'Gunshot', checked: false },
    { type: 'human voice', label: 'Human voice', checked: false },
    { type: 'bark', label: 'Bark', checked: false },
    { type: 'elephant', label: 'Elephant', checked: false },
    { type: 'fire', label: 'Fire', checked: false }
  ]

  mounted (): void {
    void this.onUpdatePage()
  }

  data (): Record<string, unknown> {
    return {
      eventType: this.eventType,
      streamStatus: this.streamStatus,
      selectedStream: this.selectedStream,
      t: useI18n()
    }
  }

  public getSelectedType (): string | undefined {
    const s = this.eventType.find(e => e.checked)
    return s?.label
  }

  public toggleTypeMenu (): void {
    this.typeSelected = !this.typeSelected
  }

  public toggleType (type: EventType): void {
    this.eventType.forEach((e: EventType) => { e.checked = false })
    type.checked = true
    // TODO::Add action after selected type
  }

  public async getStreamsData (projectId?: string): Promise<void> {
    this.isLoading = true
    return await StreamService.getStreams({
      ...projectId !== undefined && { projects: [projectId] },
      limit: 100,
      offset: 0,
      limit_incidents: 1
    }).then(res => {
      this.streamsData = res.data
      res.data.forEach((s: Stream) => { this.streamStatus.push({ id: s.id, label: s.name, checked: false }) })
      this.streamStatus[0].checked = true
      this.getSelectedStream()
    }).catch(e => {
      console.error('Error getting streams with incidents', e)
    }).finally(() => {
      this.isLoading = false
    })
  }

  async onUpdatePage (): Promise<void> {
    console.log(this.getProjectIdFromRouterParams())
    await this.getStreamsData(this.getProjectIdFromRouterParams())
  }

  public getProjectIdFromRouterParams (): string {
    const projectId: string = this.$route.params.projectId as string
    return projectId
  }

  public getSelectedStream (): string | undefined {
    const s = this.streamStatus.find(i => i.checked)
    return s?.label
  }

  public toggleStreamMenu (): void {
    this.streamSelected = !this.streamSelected
  }

  public toggleStream (stream: StreamStatus): void {
    this.streamStatus.forEach((s: StreamStatus) => { s.checked = false })
    stream.checked = true
    // TODO::Add action after selected stream
  }
}
