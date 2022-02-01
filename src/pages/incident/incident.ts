import Mapbox from 'mapbox-gl'
import { Options, Vue } from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import MapComponent from '@/components/map/map.vue'
import RangerNotes from '@/components/ranger-notes/ranger-notes.vue'
import RangerPlayerComponent from '@/components/ranger-player-modal/ranger-player-modal.vue'
import RangerSliderComponent from '@/components/ranger-slider/ranger-slider.vue'
import RangerTrackModalComponent from '@/components/ranger-track-modal/ranger-track-modal.vue'
import { IncidentsService, StreamService } from '@/services'
import { Answer, AnswerItem, Event, Incident, MapboxOptions, Response, ResponseExtended, ResponseExtendedWithStatus, Stream, User } from '@/types'
import { downloadContext, formatDateTimeLabel, formatDateTimeRange, formatDayTimeLabel, formatDayWithoutTime, formatTimeLabel, formatTwoDateDiff, getDay, getGmtDiff, inLast1Minute, inLast24Hours, isDateToday, isDateYesterday, isDefined, isNotDefined } from '@/utils'
import icons from '../../assets/index'

interface IncidentLabel extends Incident {
  eventsTitle: string
  eventsLabel: string
  responseTitle: string
  responseLabel: string
}
interface EventItem {
  title: string
  value: string
  count: number
}

type IncidentItem<T> = T & IncidentLabel

@Options({
  components: {
    InvalidProjectComponent,
    MapComponent,
    RangerTrackModalComponent,
    RangerPlayerComponent,
    RangerSliderComponent,
    RangerNotes
  }
})
export default class IncidentPage extends Vue {
  public streamsData: Stream[] = []
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
      timerSub: this.timerSub
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
    await this.getStreamsData()
    await this.getIncidentData()
    await this.getAssets()
  }

  public getEventsTitle (events: Event[]): string {
    const start = (this.getFirstOrLastItem(events, true) as Event).start
    const end = (this.getFirstOrLastItem(events, false) as Event).end
    return `${formatDateTimeLabel(start)} - ${formatDateTimeLabel(end)}`
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public setDefaultReportImg (e: any): void {
    e.target.src = icons.reportIcon
  }

  public getFirstOrLastItem (items: Response[] | Event[], firstItem: boolean): Response | Event {
    items.sort((a: Response | Event, b: Response | Event) => {
      const dateA = new Date(this.getItemDatetime(a, firstItem)).valueOf()
      const dateB = new Date(this.getItemDatetime(b, firstItem)).valueOf()
      return firstItem ? dateA - dateB : dateB - dateA
    })
    return items[0]
  }

  public getItemDatetime (item: Response | Event, first: boolean): string {
    const itemIsEvent = (item as Event).start !== undefined
    return itemIsEvent ? (first ? (item as Event).start : (item as Event).end) : (item as Response).submittedAt
  }

  public getEventsLabel (events: Event[]): string {
    const start = (this.getFirstOrLastItem(events, true) as Event).start
    const end = (this.getFirstOrLastItem(events, false) as Event).end
    return formatDateTimeRange(start, end, this.stream?.timezone)
  }

  public getEventsCount (events: Event[]): EventItem[] {
    // eslint-disable-next-line prefer-const
    let rows: any = {}
    events.forEach((e: Event) => {
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

  public getIconTitle (count: number, title: string): string {
    return `${count} ${title} ${count > 1 ? 'events' : 'event'}`
  }

  public getResponseTitle (responses: Response[]): string {
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    return formatDateTimeLabel(firstResponse)
  }

  public getResponseLabel (responses: Response[]): string {
    const firstResponse = (this.getFirstOrLastItem(responses, true) as Response).submittedAt
    // today => Today, X
    if (isDateToday(firstResponse, this.stream?.timezone)) {
      return `Today, ${formatTimeLabel(firstResponse, this.stream?.timezone)}`
    }
    // yesterday => Yesterday, X
    if (isDateYesterday(firstResponse, this.stream?.timezone)) {
      return `Yesterday, ${formatTimeLabel(firstResponse, this.stream?.timezone)}`
    } else return `${getDay(firstResponse, this.stream?.timezone)}`
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

  public async closeReport (): Promise<void> {
    try {
      await IncidentsService.closeIncident((this.$route.params.id as string))
      this.isLoading = true
      void this.getIncidentData()
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
      this.incidentStatus = this.incident.closedAt ? `Closed on ${(inLast24Hours(this.incident.closedAt) ? formatDayTimeLabel : formatDayWithoutTime)(this.incident.closedAt, this.stream?.timezone ?? 'UTC')}` : 'Mark as closed'
    }
  }

  public dateFormatted (date: string): string {
    return formatDayTimeLabel(date, this.stream?.timezone ?? 'UTC')
  }

  public formatDayWithoutTime (date: string): string {
    return formatDayWithoutTime(date, this.stream?.timezone ?? 'UTC')
  }

  public getGmtDiffFormat (date: string): string {
    return getGmtDiff(date, this.stream?.timezone ?? 'UTC')
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.stream?.timezone ?? 'UTC')
  }

  public hoursDiffFormatted (from: string, to: string): string {
    return formatTwoDateDiff(from, to)
  }

  public async getStreamsData (): Promise<void> {
    const params: string = this.$route.params.projectId as string
    if (!params) return
    const streamsData = await StreamService.getStreams({ projects: [params] })
    this.streamsData = streamsData.data
  }

  public async initializeStream (id?: string): Promise<void> {
    this.stream = this.streamsData.find((s: Stream) => {
      return s.id === (this.incident?.streamId ?? id)
    })
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
          await this.initializeStream(incident.streamId)
          this.initializeIncidentMap()
          const inc: IncidentItem<IncidentLabel> = Object.assign(incident, {
            eventsTitle: incident.events.length ? this.getEventsTitle(incident.events) : '',
            eventsLabel: incident.events.length ? this.getEventsLabel(incident.events) : '',
            responseTitle: incident.responses.length ? this.getResponseTitle(incident.responses) : '',
            responseLabel: incident.responses.length ? this.getResponseLabel(incident.responses) : ''
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
    this.isAssetsLoading = true
    await this.getResponsesAssets()
    await this.getResposeDetails()
    this.isAssetsLoading = false
  }

  public async getResponsesAssets (): Promise<void> {
    if (this.incident !== undefined) {
      const items = (this.incident.items.filter(i => i.type === 'response')) as ResponseExtended[]
      for (const item of items) {
        item.assetsData = await IncidentsService.getResposesAssets(item.id)
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
              if (a.mimeType.includes('image') === true) {
                item.sliderData = []
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

  public combineAnswers (answer: Answer | undefined, id: number, color: string): AnswerItem[] | undefined {
    return answer?.items.map((a: AnswerItem) => {
      return {
        text: id === 3 ? `Logging scale: ${a?.text}` : id === 7 ? `Poaching scale: ${a?.text}` : id === 4 ? `Damage scale: ${a?.text}` : a.text,
        color: color
      }
    })
  }

  public async getResposeDetails (): Promise<void> {
    if (this.incident !== undefined) {
      const items = (this.incident.items.filter(i => i.type === 'response')) as ResponseExtended[]
      for (const item of items) {
        if (item.type === 'response') {
          const response = await IncidentsService.getResposeDetails(item.id)
          if (isDefined(response.answers)) {
            item.messages = {}
            if (response.answers.find(i => i.question.id === 1)) {
              const evidences = response.answers.find(i => i.question.id === 1)
              item.messages.evidences = this.combineAnswers(evidences, 1, 'text-blue-500')
            }
            if (response.answers.find(i => i.question.id === 3)) {
              const loggingScale = response.answers.find(i => i.question.id === 3)
              item.messages.loggingScale = this.combineAnswers(loggingScale, 3, 'text-green-500')
            }
            if (response.answers.find(i => i.question.id === 6)) {
              const poachingReport = response.answers.find(i => i.question.id === 6)
              item.messages.poachingReport = this.combineAnswers(poachingReport, 6, 'text-red-300')
            }
            if (response.answers.find(i => i.question.id === 7)) {
              const poachingScale = response.answers.find(i => i.question.id === 7)
              item.messages.poachingScale = this.combineAnswers(poachingScale, 7, 'text-yellow-500')
            }
            if (response.answers.find(i => i.question.id === 2)) {
              const actions = response.answers.find(i => i.question.id === 2)
              item.messages.actions = this.combineAnswers(actions, 2, 'text-violet-500')
            }
            if (response.answers.find(i => i.question.id === 4)) {
              const damage = response.answers.find(i => i.question.id === 4)
              item.messages.damageScale = this.combineAnswers(damage, 4, 'text-orange-500')
            }
          }
        }
      }
    }
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
