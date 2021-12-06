import { Options, Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { IncidentsService } from '@/services'
import { downloadContext } from '@/utils'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerPlayerComponent extends Vue {
  @Prop({ default: null })
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  audioProp!: any

  public isLoading = false
  public isPlaying = false
  public isDownloading = false
  public isError = false
  public audio: HTMLAudioElement | null | undefined

  @Watch('audioProp')
  onAudioPropChange (): void {
    this.isLoading = true
    this.isError = false
    if (this.audioProp.src !== undefined) {
      this.initializeAudio()
    }
  }

  @Emit('closePlayer')
  public closePlayer (): boolean {
    return true
  }

  mounted (): void {
    this.isLoading = true
    if (this.audioProp.src !== undefined) {
      this.initializeAudio()
    }
  }

  public initializeAudio (): void {
    this.audio = new Audio()
    const source = document.createElement('source')
    this.audio.appendChild(source)
    this.audio.volume = 0.9
    source.type = this.audioProp.mimeType
    source.src = window.URL.createObjectURL(this.audioProp.src)
    this.audio.load()
    this.isLoading = false
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

  public close (): void {
    if (this.isPlaying) {
      if (this.audio) this.audio.pause()
      this.isPlaying = false
      this.audio = null
    }
    this.closePlayer()
  }

  public async downloadAssets (): Promise<void> {
    try {
      this.isDownloading = true
      const asset = await IncidentsService.getFiles(this.audioProp.assetId, this.audioProp.mimeType)
      downloadContext(asset, this.audioProp.fileName)
      this.isDownloading = false
    } catch (e) {
      this.isDownloading = false
      this.isError = true
    }
  }
}
