import { Options, Vue } from 'vue-class-component'

import InvalidProjectComponent from '@/components/invalid-project/invalid-project.vue'
import RangerNotes from '@/components/ranger-notes/ranger-notes.vue'
import RangerPlayerComponent from '@/components/ranger-player-modal/ranger-player-modal.vue'
import RangerSliderComponent from '@/components/ranger-slider/ranger-slider.vue'
import RangerTrackModalComponent from '@/components/ranger-track-modal/ranger-track-modal.vue'
import { IncidentsService, StreamService, VuexService } from '@/services'
import { Answer, AnswerItem, Event, Incident, ResponseExtended, ResponseExtendedWithStatus, Stream, User } from '@/types'
import { downloadContext, formatDayTimeLabel, formatDayWithoutTime, formatTimeLabel, formatTwoDateDiff, inLast1Minute, inLast24Hours, isDefined, isNotDefined } from '@/utils'

@Options({
  components: {
    InvalidProjectComponent,
    RangerTrackModalComponent,
    RangerPlayerComponent,
    RangerSliderComponent,
    RangerNotes
  }
})
export default class IncidentPage extends Vue {
  public streamsData: Stream[] = []
  public incident: Incident | undefined
  public stream: Stream | undefined
  public incidentStatus = ''
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
      .then(() => {
        void this.getStreamsData()
          .then(() => {
            // Check stream in Vuex store.
            void this.initializeStream()
            if (!this.stream) {
              // Get a new streams list.
              void this.getStreamsDataFromDB()
                .then(() => {
                  void this.initializeStream()
                })
            }
          })
        void this.getAssets()
      })
  }

  public toggleTrack (response: ResponseExtended, open: boolean): void {
    response.showTrack = open
    if (response.showTrack) {
      void this.getAssetsDetails(response, 'geo')
    }
  }

  public toggleNotes (response: ResponseExtended, open: boolean): void {
    response.showNotes = open
    if (response.showNotes) {
      void this.getAssetsDetails(response, 'text')
    }
  }

  public toggleSlider (response: ResponseExtended, open: boolean): void {
    response.showSlider = open
    if (response.showSlider) {
      void this.getAssetsDetails(response, 'image')
    }
  }

  public togglePlayer (response: ResponseExtended, open: boolean): void {
    response.showPlayer = open
    if (response.showPlayer) {
      void this.getAssetsDetails(response, 'audio')
    }
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

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.stream?.timezone ?? 'UTC')
  }

  public hoursDiffFormatted (from: string, to: string): string {
    return formatTwoDateDiff(from, to)
  }

  public async getStreamsData (): Promise<void> {
    this.streamsData = VuexService.Projects.streams.get()
    if (!this.streamsData.length) {
      void this.getStreamsDataFromDB()
    }
  }

  public async getStreamsDataFromDB (): Promise<void> {
    const params: string = this.$route.params.projectId as string
    const streamsData = await StreamService.getStreams({ projects: [params] })
    this.streamsData = streamsData.data
    await VuexService.Projects.streams.set(this.streamsData)
  }

  public async initializeStream (): Promise<void> {
    this.stream = this.streamsData.find((s: Stream) => {
      return s.id === this.incident?.streamId
    })
  }

  public async getData (): Promise<void> {
    try {
      this.incident = await IncidentsService.getIncident((this.$route.params.id as string))
        .then((incident: Incident) => {
          IncidentsService.combineIncidentItems(incident)
          return incident
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
          if (a.mimeType.includes('audio') === true) {
            item.audioObject = {}
          }
          if (a.mimeType.includes('text') === true) {
            item.notesData = []
          }
          if (a.mimeType.includes('image') === true) {
            item.sliderData = []
          }
          if (a.mimeType.includes('geo') === true) {
            item.trackData = {}
          }
        }
      }
    }
  }

  public async getAssetsDetails (response: ResponseExtended, type: string): Promise<void> {
    this.clearAssetsDetails(response)
    const assetsData = response.assetsData.filter(r => r.mimeType.includes(type) === true)
    for (const a of assetsData) {
      const asset = await IncidentsService.getFiles(a.id)
      if (isDefined(a) && isNotDefined(a.mimeType)) return
      if (a.mimeType.includes('audio') === true && isDefined(asset)) {
        response.audioObject.src = asset
        response.audioObject.assetId = a.id
        response.audioObject.fileName = a.fileName
        response.audioObject.mimeType = a.mimeType
      }
      await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('loadend', () => {
          const contents = reader.result as string
          if (a.mimeType.includes('image') === true) {
            response.sliderData.push({
              src: contents,
              assetId: a.id,
              fileName: a.fileName
            })
          }
          if (a.mimeType.includes('text') === true && asset.size !== undefined) {
            if ((contents).trim().length) {
              response.notesData.push(contents)
            }
          }
          if (a.mimeType.includes('geo') === true) {
            try {
              response.trackData = JSON.parse(contents)
            } catch (e) {}
          }
          resolve(contents)
        })
        if ((a.mimeType.includes('geo') === true || a.mimeType.includes('text') === true) && asset.size !== undefined) reader.readAsText(asset)
        else reader.readAsDataURL(asset)
      })
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

  public getFirstItem (items: Event[]): Event {
    items.sort((a: Event, b: Event) => {
      const dateA = new Date(this.getItemDatetime(a)).valueOf()
      const dateB = new Date(this.getItemDatetime(b)).valueOf()
      return dateA - dateB
    })
    return items[0]
  }

  public getItemDatetime (item: Event): string {
    return item.start
  }

  public async downloadAssets (item: ResponseExtendedWithStatus<ResponseExtended>): Promise<void> {
    try {
      item.isDownloading = true
      let tempArray = []
      if (item.audioObject !== undefined) {
        if (item.audioObject.src !== undefined) {
          tempArray.push(item.audioObject)
        } else {
          await this.getAssetsDetails(item, 'audio')
          tempArray.push(item.audioObject)
        }
      }
      if (item.sliderData !== undefined) {
        if (item.sliderData.length) {
          tempArray = tempArray.concat([...new Set(item.sliderData)])
        } else {
          await this.getAssetsDetails(item, 'image')
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
