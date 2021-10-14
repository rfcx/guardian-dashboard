import { Options, Vue } from 'vue-class-component'
import { ProjectModels, StreamModels, IncidentModel } from '@/models'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { formatDayWithoutTime, formatHoursLabel } from '@/utils'
import IncidentsTableRows from '../../components/incidents-table/incidents-table.vue'

@Options({
  components: {
    IncidentsTableRows
  }
})
export default class IncidentsPage extends Vue {
  @VuexService.Project.projects.bind()
  projects!: ProjectModels.ProjectListItem[]

  public selectedProject: ProjectModels.ProjectListItem | undefined
  public isLoading = false
  public incidents: IncidentModel.Incident[] = []
  public streamsData: StreamModels.Stream[] = []
  public originalData: IncidentModel.Incident[] = []
  public limit = 2
  public routerParam: any = {}
  public alertsLabel = ''

  updated (): void {
    if (this.$route.params && (this.selectedProject && this.selectedProject.id !== this.$route.params.projectId)) {
      this.getSelectedProject()
      this.isLoading = true
      this.getIncidentsData(this.$route.params.projectId)
    }
    if (this.$route.params && this.$route.params.isOpenedIncidents) {
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
    this.getStreamsData(this.$route.params.projectId)
    this.getIncidentsData(this.$route.params.projectId)
  }

  public getSelectedProject (): any {
    this.selectedProject = this.projects.find(p => p.id === this.$route.params.projectId)
  }

  public getStreamById (streamId: string): any {
    const stream = this.streamsData.find(s => s.id === streamId)
    return stream
  }

  public getStreamName (streamId: string): string | null {
    const stream = this.getStreamById(streamId)
    return stream ? stream.name : null
  }

  public getStreamTimezone (streamId: string): string {
    const stream = this.getStreamById(streamId)
    return stream ? stream.timezone : null
  }

  public getIncidentStatus (incident: IncidentModel.Incident): any {
    const timezone = this.getStreamTimezone(incident.streamId)
    if (timezone) {
      const status = incident.closedAt
        ? `report closed ${formatHoursLabel(incident.closedAt, timezone)} ago`
        : incident.responses.length
          ? `response time ${formatHoursLabel(incident.responses[0].createdAt, timezone)}`
          : `${formatHoursLabel(incident.createdAt, timezone)} without responce`
      return status
    }
  }

  public itemsLabel (incident: IncidentModel.Incident): string {
    const timezone = this.getStreamTimezone(incident.streamId)
    const items = incident.items.slice(4)
    const eventsCount = items.filter((i: any) => i.type === 'event').length
    const responsesCount = items.filter((i: any) => i.type === 'response').length
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

  public async getStreamsData (projectId: any): Promise<void> {
    this.streamsData = await StreamService.getStreams([projectId])
    await VuexService.Project.streams.set(this.streamsData)
  }

  public async getIncidentsData (projectId: any): Promise<void> {
    this.originalData = await IncidentsService.getIncidents({ projects: projectId })
    this.incidents = this.formatIncidents()
    this.isLoading = false
  }

  public formatIncidents () {
    return this.originalData.map((incident) => {
      IncidentsService.combineIncidentItems(incident)
      return incident
    })
  }
}
