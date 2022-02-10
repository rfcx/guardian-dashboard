import { Vue } from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'

import { getPlayerTime } from '@/utils'

export default class RangerPlayerComponent extends Vue {
  @Prop({ default: null })
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  audioProp!: any

  public isLoading = false
  public isPlaying = false
  public isError = false
  public progress?: number = 0
  public audio: HTMLAudioElement | null | undefined
  public timeupdateInterval?: NodeJS.Timer

  @Watch('audioProp')
  onAudioPropChange (): void {
    this.isLoading = true
    this.isError = false
    if (this.audioProp.src !== undefined) {
      this.initializeAudio()
    }
  }

  mounted (): void {
    this.isLoading = true
    if (this.audioProp.src !== undefined) {
      this.initializeAudio()
    }
  }

  beforeDestroy (): void {
    this.clearTimeUpdateInterval()
  }

  public initializeAudio (): void {
    this.audio = new Audio()
    const source = document.createElement('source')
    this.audio.appendChild(source)
    this.audio.volume = 0.9
    source.type = this.audioProp.mimeType
    source.src = window.URL.createObjectURL(this.audioProp.src)
    this.audio.load()
    this.bindEvents(this.audio)
    this.isLoading = false
  }

  public bindEvents (audio: HTMLAudioElement): void {
    audio.addEventListener('loadedmetadata', () => {
      this.calculateTotalDuration()
      this.audioProp.current = '0:00'
    })
    audio.addEventListener('play', () => {
      this.startTimeUpdateInterval()
    })
    audio.addEventListener('pause', () => {
      this.clearTimeUpdateInterval()
    })
    audio.addEventListener('onerror', () => {
      this.isError = true
    })
  }

  public async toggleSound (): Promise<void> {
    this.isPlaying = !this.isPlaying
    if (this.audio) {
      if (!this.isPlaying) {
        void this.audio.pause()
      } else {
        void this.audio.play()
      }
    }
  }

  public startTimeUpdateInterval (): void {
    this.timeupdateInterval = setInterval(this.onTimeUpdate.bind(this), 50)
  }

  public clearTimeUpdateInterval (): void {
    if (this.timeupdateInterval) {
      clearInterval(this.timeupdateInterval)
    }
  }

  public recalculateProgress (): void {
    if (this.audio?.duration === undefined) return
    this.progress = Math.ceil(this.audio?.currentTime / this.audio.duration * 100)
  }

  public calculateTotalDuration (): void {
    if (this.audio?.duration === undefined) return
    this.audioProp.total = getPlayerTime(this.audio.duration)
  }

  public onTimeUpdate (): void {
    if (!this.audio) return
    if (!this.audio.currentTime) return
    this.recalculateProgress()
    this.audioProp.current = getPlayerTime(this.audio.currentTime)
  }

  public onProgressClicked (event: MouseEvent): void {
    if (this.audio?.duration === undefined) return
    if (event?.offsetX === undefined) return
    if (event?.target === undefined) return
    const newTime = event.offsetX / (event.target as HTMLElement).offsetWidth * Math.round(this.audio.duration)
    this.audio.currentTime = newTime
    this.onTimeUpdate()
  }
}
