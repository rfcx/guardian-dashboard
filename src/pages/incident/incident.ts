import { Options, Vue } from 'vue-class-component'

import { IncidentsService, StreamService, VuexService } from '@/services'
import { Incident, Response, Stream } from '@/types'
import { formatDayTimeLabel, formatDayWithoutTime, formatTimeLabel, formatTwoDateDifferent } from '@/utils'
import RangerNotes from '../../components/ranger-notes/ranger-notes.vue'
import RangerPlayerComponent from '../../components/ranger-player-modal/ranger-player-modal.vue'
import RangerSliderComponent from '../../components/ranger-slider/ranger-slider.vue'
import RangerTrackModalComponent from '../../components/ranger-track-modal/ranger-track-modal.vue'

type statesModelType = 'player' | 'track' | 'slider' | 'notes'
type Falsy = 0 | '' | false | null | undefined

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
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public incident: Incident = {} as any
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public stream = {} as any
  public incidentStatus = 'Mark as closed'
  public isLoading = false
  public isAssetsLoading = false

  mounted (): void {
    this.isLoading = true
    void this.getData()
  }

  public isDefined<T>(x: T): x is Exclude<T, Falsy> {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return (x as any) !== undefined && (x as any) !== null
  }

  public isNotDefined<T>(x: T): x is T & Falsy {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return (x as any) === undefined && (x as any) === null
  }

  public toggleState (key: statesModelType): void {
    this.compStates[key] = !this.compStates[key]
  }

  public toggleTrack (response: Response, open: boolean): void {
    response.showTrack = open
  }

  public toggleNotes (response: Response, open: boolean): void {
    response.showNotes = open
  }

  public toggleSlider (response: Response, open: boolean): void {
    response.showSlider = open
  }

  public togglePlayer (response: Response, open: boolean): void {
    response.showPlayer = open
  }

  public closeComponent (opt: closeDataModel): void {
    this.compStates[opt.key] = opt.toggle
  }

  public async closeReport (): Promise<void> {
    await IncidentsService.closeIncident((this.$route.params.id as string))
    if (this.isDefined(this.stream) && this.isDefined(this.stream.timezone)) {
      this.incidentStatus = `Closed on ${formatDayWithoutTime(new Date(), this.stream.timezone)}`
    }
  }

  public getColor (n: number): string {
    const classes = ['ic-violet', 'ic-blue', 'ic-green', 'ic-orange', 'ic-pink']
    return classes[n]
  }

  public dateFormatted (date: string): string {
    if (this.isDefined(this.stream) && this.isDefined(this.stream.timezone)) {
      return formatDayTimeLabel(date, this.stream.timezone)
    }
    return ''
  }

  public timeFormatted (date: string): string {
    if (this.isDefined(this.stream) && this.isDefined(this.stream.timezone)) {
      return formatTimeLabel(date, this.stream.timezone)
    }
    return ''
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
      for (const item of this.incident.items) {
        if (item.type === 'response') {
          item.assetsData = await IncidentsService.getResposesAssets(item.id)
          item.sliderData = []
          item.notesData = []
          item.audioObject = {}
          for (const a of item.assetsData) {
            const asset = await IncidentsService.getFiles(a.id)
            if (this.isDefined(a) && this.isNotDefined(a.mimeType)) return
            if (a.mimeType.includes('audio') === true && this.isDefined(asset)) {
              item.audioObject.src = asset
            }
            await new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.addEventListener('loadend', () => {
                const contents = reader.result
                if (a.mimeType.includes('image') === true) {
                  item.sliderData.push(contents)
                }
                if (a.mimeType.includes('text') === true && asset.size !== undefined) {
                  if ((contents as string).trim().length) {
                    item.notesData.push(contents)
                  }
                }
                if (a.mimeType.includes('geo') === true) {
                  try {
                    item.trackData = JSON.parse(contents as string)
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
      console.log(this.incident.items)
    }
  }

  public async getResposeDetails (): Promise<void> {
    if (this.incident !== undefined) {
      for (const item of this.incident.items) {
        if (item.type === 'response') {
          const response = await IncidentsService.getResposeDetails(item.id)
          this.isAssetsLoading = false
          if (this.isDefined(response.damageScale) || this.isDefined(response.loggingScale) || this.isDefined(response.actions) || this.isDefined(response.evidences)) {
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
