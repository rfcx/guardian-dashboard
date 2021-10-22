import { Options, Vue } from 'vue-class-component'

import { IncidentsService, StreamService, VuexService } from '@/services'
import { Incident, ResponseExtended, Stream } from '@/types'
import { formatDayTimeLabel, formatDayWithoutTime, formatTimeLabel, formatTwoDateDiff, inLast24Hours, isDefined, isNotDefined } from '@/utils'
import RangerNotes from '../../components/ranger-notes/ranger-notes.vue'
import RangerPlayerComponent from '../../components/ranger-player-modal/ranger-player-modal.vue'
import RangerSliderComponent from '../../components/ranger-slider/ranger-slider.vue'
import RangerTrackModalComponent from '../../components/ranger-track-modal/ranger-track-modal.vue'

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

  public streamsData: Stream[] = []
  public incident: Incident | undefined
  public stream: Stream | undefined
  public incidentStatus = ''
  public isLoading = false
  public isAssetsLoading = false

  data (): Record<string, unknown> {
    return {
      incident: this.incident,
      stream: this.stream
    }
  }

  mounted (): void {
    this.isLoading = true
    void this.getData()
      .then(() => {
        void this.getStreamsData()
          .then(() => {
            this.stream = this.streamsData.find((s: Stream) => {
              return s.id === this.incident?.streamId
            })
          })
        void this.getAssets()
      })
  }

  public toggleTrack (response: ResponseExtended, open: boolean): void {
    response.showTrack = open
  }

  public toggleNotes (response: ResponseExtended, open: boolean): void {
    response.showNotes = open
  }

  public toggleSlider (response: ResponseExtended, open: boolean): void {
    response.showSlider = open
  }

  public togglePlayer (response: ResponseExtended, open: boolean): void {
    response.showPlayer = open
  }

  public async closeReport (): Promise<void> {
    try {
      await IncidentsService.closeIncident((this.$route.params.id as string))
      this.isLoading = true
      void this.getData()
    } catch (e) {
      this.incidentStatus = 'Error occurred'
    }
  }

  public isError (): boolean {
    return this.incidentStatus === 'Error occurred'
  }

  public getIncidentStatus (): void {
    if (this.incident !== undefined) {
      this.incidentStatus = this.incident.closedAt ? `Closed on ${(inLast24Hours(this.incident.closedAt) ? formatDayTimeLabel : formatDayWithoutTime)(this.incident.closedAt, this.stream?.timezone ?? 'UTC')}` : 'Mark as closed'
    }
  }

  public getColor (n: number): string {
    const classes = ['ic-violet', 'ic-blue', 'ic-green', 'ic-orange', 'ic-pink']
    return classes[n]
  }

  public dateFormatted (date: string): string {
    return formatDayTimeLabel(date, this.stream?.timezone ?? 'UTC')
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.stream?.timezone ?? 'UTC')
  }

  public hoursDiffFormatted (from: string, to: string): string {
    return formatTwoDateDiff(from, to)
  }

  public async getStreamsData (): Promise<void> {
    this.streamsData = VuexService.Projects.streams.get()
    if (!this.streamsData.length) {
      this.streamsData = await StreamService.getStreams([this.$route.params.projectId])
      await VuexService.Projects.streams.set(this.streamsData)
    }
  }

  public async getData (): Promise<void> {
    this.incident = await IncidentsService.getIncident((this.$route.params.id as string))
      .then((incident: Incident) => {
        IncidentsService.combineIncidentItems(incident)
        return incident
      })
    this.getIncidentStatus()
    this.isLoading = false
  }

  public async getAssets (): Promise<void> {
    this.isAssetsLoading = true
    await this.getResponsesAssets()
    await this.getResposeDetails()
  }

  public async getResponsesAssets (): Promise<void> {
    if (this.incident !== undefined) {
      const items = (this.incident.items.filter(i => i.type === 'response')) as ResponseExtended[]
      for (const item of items) {
        item.assetsData = await IncidentsService.getResposesAssets(item.id)
        item.sliderData = []
        item.notesData = []
        item.audioObject = {}
        for (const a of item.assetsData) {
          const asset = await IncidentsService.getFiles(a.id)
          if (isDefined(a) && isNotDefined(a.mimeType)) return
          if (a.mimeType.includes('audio') === true && isDefined(asset)) {
            item.audioObject.src = asset
          }
          await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('loadend', () => {
              const contents = reader.result as string
              if (a.mimeType.includes('image') === true) {
                item.sliderData.push(contents)
              }
              if (a.mimeType.includes('text') === true && asset.size !== undefined) {
                if ((contents).trim().length) {
                  item.notesData.push(contents)
                }
              }
              if (a.mimeType.includes('geo') === true) {
                try {
                  item.trackData = JSON.parse(contents)
                } catch (e) {}
              }
              resolve(contents)
            })
            if ((a.mimeType.includes('geo') === true || a.mimeType.includes('text') === true) && asset.size !== undefined) reader.readAsText(asset)
            else reader.readAsDataURL(asset)
          })
        }
      }
      console.log(this.incident.items)
    }
  }

  public async getResposeDetails (): Promise<void> {
    if (this.incident !== undefined) {
      const items = (this.incident.items.filter(i => i.type === 'response')) as ResponseExtended[]
      for (const item of items) {
        if (item.type === 'response') {
          const response = await IncidentsService.getResposeDetails(item.id)
          this.isAssetsLoading = false
          if (isDefined(response.damageScale) || isDefined(response.loggingScale) || isDefined(response.actions) || isDefined(response.evidences)) {
            item.messages = {}
            item.messages.actions = response.actions
            item.messages.damageScale = [`Damage: ${this.damageScale[response.damageScale]}`]
            item.messages.loggingScale = [`Logging scale: ${this.loggingScale[response.loggingScale]}`]
            item.messages.evidences = response.evidences
          }
        }
      }
    }
  }
}
