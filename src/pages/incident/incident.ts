import { Options, Vue } from 'vue-class-component'

import { IncidentsService, StreamService, VuexService } from '@/services'
import { Incident, ResponseExtended, Stream } from '@/types'
import { downloadContext, formatDayTimeLabel, formatDayWithoutTime, formatTimeLabel, formatTwoDateDifferent, isDefined, isNotDefined } from '@/utils'
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

  public streamsData: Stream[] = []
  public incident: Incident | undefined
  public stream: Stream | undefined
  public incidentStatus = 'Mark as closed'
  public isLoading = false
  public isAssetsLoading = false
  private timerSub!: NodeJS.Timeout

  data (): Record<string, unknown> {
    return {
      incident: this.incident,
      stream: this.stream,
      timerSub: this.timerSub
    }
  }

  mounted (): void {
    this.isLoading = true
    void this.getData()
  }

  public toggleState (key: statesModelType): void {
    this.compStates[key] = !this.compStates[key]
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

  public closeComponent (opt: closeDataModel): void {
    this.compStates[opt.key] = opt.toggle
  }

  public async closeReport (): Promise<void> {
    await IncidentsService.closeIncident((this.$route.params.id as string))
    this.incidentStatus = `Closed on ${formatDayWithoutTime(new Date(), this.stream?.timezone ?? 'UTC')}`
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
    return formatTwoDateDifferent(from, to)
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
    this.isLoading = false
    this.isAssetsLoading = true
    void this.getStreamsData()
      .then(() => {
        this.stream = this.streamsData.find((s: Stream) => {
          return s.id === this.incident?.streamId
        })
      })
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
            item.audioObject.assetId = a.id
            item.audioObject.fileName = a.fileName
          }
          await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('loadend', () => {
              const contents = reader.result as string
              if (a.mimeType.includes('image') === true) {
                item.sliderData.push({
                  src: contents,
                  assetId: a.id,
                  fileName: a.fileName
                })
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

  public async downloadAssets (item: ResponseExtended): Promise<void> {
    try {
      item.isDownloading = true
      let tempArray = []
      if (item.audioObject.src !== undefined) {
        tempArray.push(item.audioObject)
      }
      if (item.sliderData.length) {
        tempArray = tempArray.concat([...new Set(item.sliderData)])
      }
      for (const i of tempArray) {
        const asset = await IncidentsService.getFiles(i.assetId)
        downloadContext(asset, i.fileName)
      }
      item.isDownloading = false
    } catch (e) {
      item.isDownloading = false
      item.isError = true
      if (this.timerSub !== undefined) {
        clearTimeout(this.timerSub)
      }
      this.timerSub = setTimeout(() => {
        item.isError = false
      }, 3000)
    }
  }
}
