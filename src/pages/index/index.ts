import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { IncidentsService, StreamService } from '@/services'
import { EventExtended, Incident, Project, ResponseExtended, Stream } from '@/types'
import { formatDifferentFromNow } from '@/utils'

@Options({
  components: { NavigationBarComponent }
})
export default class IndexPage extends Vue {
  public componentStreams: Stream[] | undefined
  public selectedProject: Project | undefined
  public isLoading = false

  data (): Record<string, unknown> {
    return {
      componentStreams: this.componentStreams,
      selectedProject: this.selectedProject
    }
  }

  mounted (): void {
    this.isLoading = true
    if (this.$route.params.projectId === undefined) {
      void this.getStreamsData()
    }
  }

  public formatDifferentFromNow (date: string, timezone: string): string {
    return formatDifferentFromNow(date, timezone)
  }

  public async getStreamsData (): Promise<void> {
    const streamsData: Stream[] = await StreamService.getStreams()
    this.componentStreams = streamsData
    this.isLoading = false
    for (const item of this.componentStreams) {
      await this.getIncidentsData(item)
    }
  }

  public async getIncidentsData (stream: Stream): Promise<void> {
    const originalData = await IncidentsService.getIncidents({ projects: stream.project?.id })
    stream.incidents = this.formatIncidents(originalData)
    stream.eventsCount = 0
    stream.responsesCount = 0
    stream.incidents.forEach(i => {
      stream.eventsCount += i.items.filter((i) => i.type === 'event').length
      stream.responsesCount += i.items.filter((i) => i.type === 'response').length
    })
  }

  public formatIncidents (originalData: Incident[]): Incident[] {
    return originalData.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
  }

  public isLastItemEvent (incidents: Incident[]): boolean {
    const item = this.getLastItem(incidents)
    return item?.type === 'event'
  }

  public getLastItem (incidents: Incident[]): ResponseExtended | EventExtended | undefined {
    const temp: Array<ResponseExtended | EventExtended> = []
    incidents.forEach((i: Incident) => {
      temp.push(i.items[0])
    })
    temp.sort((a: ResponseExtended | EventExtended, b: ResponseExtended | EventExtended) => {
      const dateA = new Date(this.getItemDatetime(a)).valueOf()
      const dateB = new Date(this.getItemDatetime(b)).valueOf()
      return dateB - dateA
    })
    return temp.length ? temp[0] : undefined
  }

  public getItemDatetime (item: ResponseExtended | EventExtended): string {
    return item.type === 'event' ? (item as EventExtended).createdAt : (item as ResponseExtended).submittedAt
  }

  public getLabel (incidents: Incident[], timezone: string): string {
    let label = ''
    const lastItem = this.getLastItem(incidents)
    if (lastItem !== undefined) {
      if (this.isLastItemEvent(incidents)) {
        label += `${this.formatDifferentFromNow(lastItem.createdAt, timezone)} no response`
      } else {
        label += `response time ${this.formatDifferentFromNow(lastItem.createdAt, timezone)}`
      }
    } else label += 'no data'
    return label
  }
}
