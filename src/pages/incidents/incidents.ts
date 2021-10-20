import { Options, Vue } from 'vue-class-component'

import { IncidentsService, StreamService, VuexService } from '@/services'
import { Incident, Project, Stream } from '@/types'
import { formatDayWithoutTime, formatDifferentFromNow } from '@/utils'
import IncidentsTableRows from '../../components/incidents-table/incidents-table.vue'

@Options({
  components: {
    IncidentsTableRows
  }
})
export default class IncidentsPage extends Vue {
  @VuexService.Projects.projects.bind()
  projects!: Project[]

  public selectedProject: Project | undefined
  public isLoading = false
  public incidents: Incident[] = []
  public streamsData: Stream[] = []
  public originalData: Incident[] = []
  public limit = 2
  public alertsLabel = ''

  updated (): void {
    if (this.selectedProject !== undefined && this.selectedProject.id !== this.$route.params.projectId) {
      this.getSelectedProject()
      this.isLoading = true
      void this.getIncidentsData(this.$route.params.projectId)
    } else if (this.$route.params.isOpenedIncidents !== undefined) {
      this.incidents = this.originalData.filter(incident => {
        if (this.$route.params.isOpenedIncidents === 'false') {
          return incident.closedAt
        } else return !incident.closedAt
      })
    } else {
      this.incidents = this.originalData
    }
  }

  mounted (): void {
    this.getSelectedProject()
    this.isLoading = true
    const params: string = this.$route.params.projectId as string
    void this.getStreamsData(params)
    void this.getIncidentsData(params)
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
        status = `report closed ${(formatDifferentFromNow(incident.closedAt, timezone) as string)} ago`
      } else if (incident.responses.length > 0) {
        status = `response time ${(formatDifferentFromNow(incident.responses[0].createdAt, timezone) as string)}`
      } else if (!incident.items.length) {
        return 'no events and responses'
      } else {
        status = `${(formatDifferentFromNow(incident.createdAt, timezone) as string)} without responce`
      }
    }
    return status
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

  public async getIncidentsData (projectId: string | string[]): Promise<void> {
    this.originalData = await IncidentsService.getIncidents({ projects: projectId })
    this.incidents = this.formatIncidents()
    this.isLoading = false
  }

  public formatIncidents (): Incident[] {
    return this.originalData.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
  }
}
