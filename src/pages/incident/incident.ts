import { Options, Vue } from 'vue-class-component'
import { StreamModels, IncidentModel } from '@/models'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { formatDayLabel, formatDayWithoutTime, formatTimeLabel, hoursDiffFormatted } from '@/utils'
import RangerNotes from '../../components/ranger-notes/ranger-notes.vue'
import RangerPlayerComponent from '../../components/ranger-player-modal/ranger-player-modal.vue'
import RangerSliderComponent from '../../components/ranger-slider/ranger-slider.vue'
import RangerTrackModalComponent from '../../components/ranger-track-modal/ranger-track-modal.vue'

type statesModelType = 'player' | 'track' | 'slider' | 'notes'

interface statesModel {
  player: boolean
  track: boolean
  slider: boolean
  notes: boolean
}

interface closeDataModel {
  key: statesModelType
  toggle: boolean
}

@Options({
  components: {
    RangerTrackModalComponent,
    RangerPlayerComponent,
    RangerSliderComponent,
    RangerNotes
  }
})
export default class IncidentPage extends Vue {
  public loggingScale: string[] = [
    'none',
    'not sure',
    'small',
    'large'
  ]

  public damageScale: string[] = [
    'no visible tree disruption found',
    'small number of trees cut down',
    'medium number of trees cut down',
    'large area substantially clear cut'
  ]

  public compStates: statesModel = {
    player: false,
    track: false,
    slider: false,
    notes: false
  }

  public streamsData: StreamModels.Stream[] = []
  public incident: IncidentModel.Incident = {} as IncidentModel.Incident
  public stream: StreamModels.Stream | undefined
  public incidentStatus = 'Mark as closed'

  mounted (): void {
    this.getData()
  }

  public toggleState (key: statesModelType): void {
    this.compStates[key] = !this.compStates[key]
  }

  public toggleTrack (response: any): void {
    response.track = true
  }

  public closeComponent (opt: closeDataModel): void {
    this.compStates[opt.key] = opt.toggle
  }

  public async closeReport (): Promise<void> {
    await IncidentsService.closeIncident(this.$route.params.id)
    this.incidentStatus = `Closed on ${formatDayWithoutTime(new Date(), this.stream && this.stream.timezone)}`
  }

  public getColor (n: number): string {
    const classes = ['ic-violet', 'ic-blue', 'ic-green', 'ic-orange', 'ic-pink']
    return classes[n]
  }

  public dateFormatted (date: string): string {
    return formatDayLabel(date, this.stream && this.stream.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.stream && this.stream.timezone)
  }

  public hoursDiffFormatted (from: string, to: string): string {
    return hoursDiffFormatted(from, to)
  }

  public async getStreamsData (): Promise<void> {
    this.streamsData = VuexService.Project.streams.get()
    if (!this.streamsData.length) {
      this.streamsData = await StreamService.getStreams([this.$route.params.projectId])
      await VuexService.Project.streams.set(this.streamsData)
    }
  }

  public async getData (): Promise<void> {
    this.incident = await IncidentsService.getIncident(this.$route.params.id)
      .then((incident: IncidentModel.Incident) => {
        IncidentsService.combineIncidentItems(incident)
        return incident
      })
    this.getStreamsData()
      .then(() => {
        this.stream = this.streamsData.find((s: StreamModels.Stream) => s.id === this.incident.streamId)
      })
    await this.getResponsesAssets()
    await this.getResposeDetails()
  }

  public async getResponsesAssets (): Promise<void> {
    for (const item of this.incident.items) {
      if (item.type === 'response') {
        item.assetsData = await IncidentsService.getResposesAssets(item.id)
        item.sliderData = []
        item.notesData = []
        item.audioObject = {}
        for (const a of item.assetsData) {
          const asset = await IncidentsService.getFiles(a.id)
          if (a.mimeType.includes('audio')) item.audioObject.src = asset
          await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('loadend', () => {
              const contents = reader.result
              if (a.mimeType.includes('image')) item.sliderData.push(contents)
              if (a.mimeType.includes('text') && asset.size) item.notesData.push(contents)
              resolve(contents)
            })
            if (a.mimeType.includes('text') && asset.size) reader.readAsText(asset)
            else reader.readAsDataURL(asset)
          })
        }
      }
    }
  }

  public async getResposeDetails (): Promise<void> {
    for (const item of this.incident.items) {
      if (item.type === 'response') {
        const response = await IncidentsService.getResposeDetails(item.id)
        item.messages = response.actions
        item.messages.push(`Damage: ${this.damageScale[response.damageScale]}`)
        item.messages.push(`Logging scale: ${this.loggingScale[response.loggingScale]}`)
        item.messages = item.messages.concat([...new Set(response.evidences)])
      }
    }
  }
}
