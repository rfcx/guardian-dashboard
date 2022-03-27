import Mapbox from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Watch } from 'vue-property-decorator'

import InvalidPageStateComponent from '@/components/invalid-page-state/invalid-page-state.vue'
import MapComponent from '@/components/map/map.vue'
import RangerNotes from '@/components/ranger-notes/ranger-notes.vue'
import RangerPlayerComponent from '@/components/ranger-player-modal/ranger-player-modal.vue'
import RangerSliderComponent from '@/components/ranger-slider/ranger-slider.vue'
import RangerTrackModalComponent from '@/components/ranger-track-modal/ranger-track-modal.vue'
import { IncidentsService, StreamService } from '@/services'
import { Answer, AnswerItem, Event as Ev, Incident, MapboxOptions, RawImageItem, Response, ResponseExtended, ResponseExtendedWithStatus, Stream, User } from '@/types'
import { downloadContext, formatDateTime, formatDateTimeRange, formatDateTimeWithoutYear, formatDayWithoutTime, formatTime, formatTwoDateDiff, getTzAbbr, inLast1Minute, inLast24Hours, isDefined, isNotDefined, twoDateDiffExcludeHours } from '@/utils'
import icons from '../../assets/index'

interface IncidentLabel extends Incident {
  eventsTitle: string | boolean
  eventsLabel: string | boolean
  responseTitle: string | boolean
  responseLabel: string
  resposeSummary: string[]
}
interface EventItem {
  title: string
  value: string
  count: number
}

type IncidentItem<T> = T & IncidentLabel

@Options({
  components: {
    InvalidPageStateComponent,
    MapComponent,
    RangerTrackModalComponent,
    RangerPlayerComponent,
    RangerSliderComponent,
    RangerNotes
  }
})
export default class IncidentPage extends Vue {
  public incident: IncidentItem<Incident> | undefined
  public stream: Stream | undefined
  public incidentStatus = ''
  public isLoading = false
  public isAssetsLoading = false
  public mapData: MapboxOptions | undefined
  public audio: HTMLAudioElement | null | undefined
  private timerSub!: NodeJS.Timeout

  data (): Record<string, unknown> {
    return {
      incident: this.incident,
      stream: this.stream,
      timerSub: this.timerSub,
      t: useI18n()
    }
  }

  @Watch('$route.params')
  onRouteParamsChange (): void {
    void this.onUpdatePage()
  }

  async created (): Promise<void> {
    await this.onUpdatePage()
  }

  async onUpdatePage (): Promise<void> {
    this.isLoading = true
    await this.getIncidentData()
    await this.getStreamData()
      .then(() => {
        if (this.incident !== undefined) {
          this.incident.eventsTitle = this.getEventsTitle()
          this.incident.eventsLabel = this.getEventsLabel()
          this.incident.responseTitle = this.getResponseTitle()
          this.incident.responseLabel = this.getResponseLabel()
        }
      })
    this.initializeIncidentMap()
    await this.getAssets()
  }

  public getIconTitle (count: number, title: string): string {
    return `${count} ${this.$t(title)} ${count > 1 ? this.$t('events') : this.$t('event')}`
  }

  public setDefaultReportImg (e: Event): void {
    if ((e?.target as HTMLImageElement) !== undefined) {
      (e.target as HTMLImageElement).src = icons.reportIcon
    }
  }

  public getFirstOrLastItem (items: Response[] | Ev[], firstItem: boolean): Response | Ev {
    items.sort((a: Response | Ev, b: Response | Ev) => {
      const dateA = new Date(this.getItemDatetime(a, firstItem)).valueOf()
      const dateB = new Date(this.getItemDatetime(b, firstItem)).valueOf()
      return firstItem ? dateA - dateB : dateB - dateA
    })
    return items[0]
  }

  public getItemDatetime (item: Response | Ev, first: boolean): string {
    const itemIsEvent = (item as Ev).start !== undefined
    return itemIsEvent ? (first ? (item as Ev).start : (item as Ev).end) : (item as Response).submittedAt
  }

  public getEventsTitle (): string {
    if (this.incident === undefined) return '-'
    if (this.incident !== undefined && !this.incident.events.length) return '-'
    const start = (this.getFirstOrLastItem(this.incident.events, true) as Ev).start
    const end = (this.getFirstOrLastItem(this.incident.events, false) as Ev).end
    return `${formatDateTime(start, this.stream?.timezone)} - ${formatDateTime(end, this.stream?.timezone)}`
  }

  public getEventsLabel (): string {
    if (this.incident === undefined) return '-'
    if (this.incident !== undefined && !this.incident.events.length) return '-'
    const start = (this.getFirstOrLastItem(this.incident.events, true) as Ev).start
    const end = (this.getFirstOrLastItem(this.incident.events, false) as Ev).end
    return formatDateTimeRange(start, end, this.stream?.timezone)
  }

  public getEventsCount (events: Ev[]): EventItem[] {
    const rows: Record<string, EventItem> = {}
    events.forEach((e: Ev) => {
      if (rows[e.classification.value] === undefined) {
        rows[e.classification.value] = {
          value: e.classification.value,
          title: e.classification.title.charAt(0).toLowerCase() + e.classification.title.slice(1),
          count: 1
        }
      } else {
        rows[e.classification.value].count++
      }
    })
    return Object.values(rows)
  }

  public getResponseTitle (): string {
    if (this.incident === undefined) return '-'
    if (this.incident !== undefined && !this.incident.responses.length) return '-'
    const firstResponse = (this.getFirstOrLastItem(this.incident.responses, true) as Response).submittedAt
    return formatDateTime(firstResponse, this.stream?.timezone)
  }

  public getResponseLabel (): string {
    if (this.incident === undefined) return '-'
    if (!this.incident.responses.length || !this.incident.events.length) return '-'
    return `${(twoDateDiffExcludeHours((this.getFirstOrLastItem(this.incident.events, true) as Ev).start, (this.getFirstOrLastItem(this.incident.responses, true) as Response).submittedAt, true) as string)}`
  }

  public toggleTrack (response: ResponseExtended, open: boolean): void {
    response.showTrack = open
  }

  public toggleSlider (response: ResponseExtended, open: boolean, image?: RawImageItem): void {
    response.showSlider = open
    if (!open && response !== undefined && response.sliderData) {
      response.sliderData.forEach((item: RawImageItem) => { item.selected = false })
    }
    if (image) image.selected = true
  }

  public async closeReport (): Promise<void> {
    try {
      await IncidentsService.closeIncident((this.$route.params.id as string))
      void this.onUpdatePage()
    } catch (e) {
      this.incidentStatus = 'Error occurred'
    }
  }

  public isError (): boolean {
    return this.incidentStatus === 'Error occurred'
  }

  public checkTimeToReceive (from: string, to: string): boolean {
    return inLast1Minute(from, to)
  }

  public getIncidentStatus (): void {
    if (this.incident !== undefined) {
      this.incidentStatus = this.incident.closedAt ? `Closed on ${(inLast24Hours(this.incident.closedAt) ? formatDateTimeWithoutYear : formatDayWithoutTime)(this.incident.closedAt, this.stream?.timezone ?? 'UTC')}` : 'Mark as closed'
    }
  }

  public dateFormatted (date: string): string {
    return formatDateTimeWithoutYear(date, this.stream?.timezone ?? 'UTC')
  }

  public formatDayWithoutTime (date: string): string {
    return formatDayWithoutTime(date, this.stream?.timezone ?? 'UTC')
  }

  public getTzAbbrFormat (date: string): string | undefined {
    const label = getTzAbbr(date, this.stream?.timezone ?? 'UTC')
    if (label) return `(${label})`
  }

  public timeFormatted (date: string): string {
    return formatTime(date, this.stream?.timezone ?? 'UTC')
  }

  public hoursDiffFormatted (from: string, to: string): string {
    return formatTwoDateDiff(from, to)
  }

  public async getStreamData (): Promise<void> {
    if (!this.incident?.streamId) return
    const streamData = await StreamService.getStream(this.incident.streamId)
    this.stream = streamData.data
  }

  public initializeIncidentMap (): void {
    if (this.stream === undefined) return
    if (this.stream.latitude !== undefined && this.stream.longitude !== undefined) {
      this.mapData = {
        center: new Mapbox.LngLat(this.stream.longitude, this.stream.latitude),
        zoom: 6
      }
    }
  }

  public async getIncidentData (): Promise<void> {
    try {
      const incidentId = this.$route.params.id as string
      if (!incidentId) return
      this.incident = await IncidentsService.getIncident(incidentId)
        .then(async (incident: Incident) => {
          IncidentsService.combineIncidentItems(incident)
          const inc: IncidentItem<IncidentLabel> = Object.assign(incident, {
            eventsTitle: true,
            eventsLabel: true,
            responseTitle: true,
            responseLabel: '',
            resposeSummary: []
          })
          return inc
        })
      this.isLoading = false
      this.getIncidentStatus()
    } catch (e) {
      this.isLoading = false
    }
  }

  public async getAssets (): Promise<void> {
    await this.getResposeDetails()
    await this.getResponsesAssets()
  }

  public async getResponsesAssets (): Promise<void> {
    if (this.incident !== undefined) {
      this.isAssetsLoading = true
      const items = (this.incident.items.filter(i => i.type === 'response')) as ResponseExtended[]
      for (const item of items) {
        item.assetsData = await IncidentsService.getResposesAssets(item.id)
        item.sliderData = []
        for (const a of item.assetsData) {
          if (isDefined(a) && isNotDefined(a.mimeType)) return
          const asset = await IncidentsService.getFiles(a.id)
          if (a.mimeType.includes('audio') === true && isDefined(asset)) {
            item.audioObject = {
              src: asset,
              assetId: a.id,
              fileName: a.fileName,
              mimeType: a.mimeType
            }
            const audioEl = document.getElementById(`audioResponse_${item.id}`)
            const blobURL = window.URL.createObjectURL(item.audioObject.src)
            if (audioEl) {
              audioEl.setAttribute('src', blobURL)
            }
          }
          await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('loadend', () => {
              const contents = reader.result as string
              if (a.mimeType.includes('image') === true && item.sliderData) {
                item.sliderData.push({
                  src: contents,
                  assetId: a.id,
                  fileName: a.fileName
                })
              }
              if (a.mimeType.includes('text') === true && asset.size !== undefined) {
                item.notesData = []
                if ((contents).trim().length) {
                  item.notesData.push(contents)
                }
              }
              if (a.mimeType.includes('geo') === true) {
                item.trackData = {}
                try {
                  item.trackData = JSON.parse(contents)
                  item.trackData.settings = {
                    center: new Mapbox.LngLat(item.trackData.features[0].geometry.coordinates[0][0], item.trackData.features[0].geometry.coordinates[0][1]),
                    zoom: 8
                  }
                } catch (e) {}
              }
              resolve(contents)
            })
            if ((a.mimeType.includes('geo') === true || a.mimeType.includes('text') === true) && asset.size !== undefined) reader.readAsText(asset)
            else reader.readAsDataURL(asset)
          })
        }
      }
      this.isAssetsLoading = false
    }
  }

  public clearAssetsDetails (response: ResponseExtended): void {
    if (response.audioObject !== undefined) {
      response.audioObject = {}
    }
    if (response.notesData !== undefined) {
      response.notesData = []
    }
    if (response.sliderData !== undefined) {
      response.sliderData = []
    }
    if (response.trackData !== undefined) {
      response.trackData = {}
    }
  }

  public combineAnswers (answer: Answer | undefined): string[] | undefined {
    return answer?.items.map((a: AnswerItem) => {
      return a.text
    })
  }

  public async getResposeDetails (): Promise<void> {
    if (this.incident !== undefined) {
      this.isAssetsLoading = true
      const items = (this.incident.items.filter(i => i.type === 'response')) as ResponseExtended[]
      for (const item of items) {
        if (item.type === 'response') {
          const response = await IncidentsService.getResposeDetails(item.id)
          if (isDefined(response.answers)) {
            item.messages = {}
            if (response.answers.find(i => i.question.id === 1)) {
              const loggingEvidence = response.answers.find(i => i.question.id === 1)
              item.messages.loggingEvidence = this.combineAnswers(loggingEvidence)
            }
            if (response.answers.find(i => i.question.id === 3)) {
              const loggingScale = response.answers.find(i => i.question.id === 3)
              item.messages.loggingScale = this.combineAnswers(loggingScale)
            }
            if (response.answers.find(i => i.question.id === 6)) {
              const poachingEvidence = response.answers.find(i => i.question.id === 6)
              item.messages.poachingEvidence = this.combineAnswers(poachingEvidence)
            }
            if (response.answers.find(i => i.question.id === 7)) {
              const poachingScale = response.answers.find(i => i.question.id === 7)
              item.messages.poachingScale = this.combineAnswers(poachingScale)
            }
            if (response.answers.find(i => i.question.id === 2)) {
              const actions = response.answers.find(i => i.question.id === 2)
              item.messages.actions = this.combineAnswers(actions)
            }
            if (response.answers.find(i => i.question.id === 5)) {
              const investigate = response.answers.find(i => i.question.id === 5)
              const arr = this.combineAnswers(investigate)
              if ((arr?.length) != null) {
                const isPoachingEvidence: boolean = item.messages.poachingEvidence
                const isLoggingEvidence: boolean = item.messages.loggingEvidence
                this.incident.resposeSummary = [...new Set(this.incident.resposeSummary.concat(arr.filter(item => {
                  return this.checkResposeSummary(item, isPoachingEvidence, isLoggingEvidence)
                })))]
              }
            }
          }
        }
      }
      this.incident.resposeSummary = [...new Set(this.incident.resposeSummary)]
      this.isAssetsLoading = false
    }
  }

  public checkResposeSummary (item: string, isPoachingEvidence: boolean, isLoggingEvidence: boolean): boolean | undefined {
    if (item === undefined) return false
    if (item === 'Other') return false
    else if (item === 'Poaching' && isPoachingEvidence) return true
    else if (item === 'Logging' && isLoggingEvidence) return true
  }

  public getCreatedByLabel (user: User): string {
    if (user.firstname || user.lastname) {
      return `${user.firstname} ${user.lastname}`
    } else return user.email
  }

  public async downloadAssets (item: ResponseExtendedWithStatus<ResponseExtended>): Promise<void> {
    try {
      item.isDownloading = true
      let tempArray = []
      if (item.audioObject !== undefined) {
        if (item.audioObject.src !== undefined) {
          tempArray.push(item.audioObject)
        } else {
          tempArray.push(item.audioObject)
        }
      }
      if (item.sliderData !== undefined) {
        if (item.sliderData.length) {
          tempArray = tempArray.concat([...new Set(item.sliderData)])
        } else {
          tempArray = tempArray.concat([...new Set(item.sliderData)])
        }
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
