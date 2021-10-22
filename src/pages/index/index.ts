import { Options, Vue } from 'vue-class-component'

import NavigationBarComponent from '@/components/navbar/navbar.vue'
import { IncidentsService, StreamService } from '@/services'
import { Event, EventExtended, Incident, Project, ResponseExtended, Stream } from '@/types'
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
    stream.lastEvents = []
    stream.incidents.forEach(i => {
      if (i.events.length && i.responses.length) {
        const lastResponse = i.responses[0]
        const events = i.events.filter(e => e.createdAt > lastResponse.createdAt)
        stream.lastEvents = events
        stream.eventsCount += events.length
        this.sortItems(stream.lastEvents)
      }
    })
  }

  public formatIncidents (originalData: Incident[]): Incident[] {
    return originalData.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
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

  public noEventsLabel (events: Event[], timezone: string): string {
    return events.length ? `${this.formatDifferentFromNow(events[0].createdAt, timezone)} no response` : ''
  }

  public getResponsesLabel (incidents: Incident[], timezone: string): string {
    const temp: Array<ResponseExtended | EventExtended> = []
    incidents.forEach((i: Incident) => {
      temp.push(i.items[0])
    })
    this.sortItems(temp)
    return `response time ${this.formatDifferentFromNow(temp[0].createdAt, timezone)}`
  }
}
