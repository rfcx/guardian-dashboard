import { Vue, Options } from 'vue-class-component'
import { ProjectModels, StreamModels } from '@/models'
import { VuexService, IncidentsService, StreamService } from '@/services'
import { formatHoursLabel, formatDayWithoutTime } from '@/utils'
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
  public isLoading: boolean = false
  public incidents: Array<any> = []
  public streamsData: StreamModels.Stream[] = []
  public originalData: Array<any> = []
  public limit: number = 2
  public routerParam: any = {}
  public alertsLabel: string = ''

  updated(): void {
    if (this.$route.params && (this.selectedProject && this.selectedProject.id !== this.$route.params.projectId)) {
      this.getSelectedProject()
      this.isLoading = true
      this.getIncidentsData(this.$route.params.projectId)
    }
    if (this.$route.params && this.$route.params.isOpenedIncidents) {
      this.incidents = this.originalData.filter(incident => {
        if (this.$route.params.isOpenedIncidents === 'false') {
          return incident.closedAt;
        }
        else return !incident.closedAt;
      })
    }
    else {
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
    this.selectedProject = this.projects.find(p=>p.id===this.$route.params.projectId)
  }

  public getStreamById (streamId: string): any {
    let stream = this.streamsData.find(s => s.id === streamId)
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

  public getIncidentStatus (incident: any): any {
    let timezone = this.getStreamTimezone(incident.streamId)
    let status = incident.closedAt ?
      `report closed ${formatHoursLabel(incident.closedAt, timezone)} ago` :
        incident.responses.length ? `response time ${formatHoursLabel(incident.responses[0].createdAt, timezone)}`
          : `${formatHoursLabel(incident.createdAt, timezone)} without responce`
    return status
  }

  public itemsLabel (incident: any): string {
    let timezone = this.getStreamTimezone(incident.streamId)
    const items = incident.items.slice(4)
    const eventsCount = items.filter((i: any) => i.type === 'event').length
    const responsesCount = items.filter((i: any) => i.type === 'response').length
    let str = ''
    if (eventsCount > 0) {
      str += `${eventsCount} events `
      if (responsesCount > 0) {
        str += `and `
      }
    }
    if (responsesCount > 0) {
      str += `${responsesCount} responses `
    }
    str += `since ${formatDayWithoutTime(incident.createdAt, timezone)}`
    return str
  }

  public async getStreamsData (projectId: any): Promise<void> {
    this.streamsData = await StreamService.getStreams([projectId]);
    await VuexService.Project.streams.set(this.streamsData)
  }

  public async getIncidentsData (projectId: any): Promise<void> {
    this.originalData = await IncidentsService.getIncidents({ projects: projectId });
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

