import { Vue, Options } from 'vue-class-component'
import { OnClickOutside } from '@vueuse/components'
import { Emit, Prop, Watch } from 'vue-property-decorator'
import { AudioModel } from '@/models'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerPlayerComponent extends Vue {

  @Prop({ default: null })
  audioProp!: any

  @Prop({ default: false })
  initialState!: boolean | false

  public isLoading: boolean = false
  public isPlaying: boolean = false
  public audio: any

  @Watch('initialState')
  onInitialStateChange (): void {
    this.isLoading = true
    if (this.audioProp.src) {
      this.initializeAudio()
    }
  }

  @Emit('closePlayer')
  public closePlayer (): any {
    return { key: 'player', toggle: false }
  }

  public initializeAudio() {
    this.audio = new Audio()
    this.audio.volume = 0.9
    this.audio.addEventListener('canplay', (data: any) => {
      console.log('canplay', data);
    });
    this.audio.addEventListener('error', (e: any) => {
      console.log('err', e);
    });
    this.audio.src = window.URL.createObjectURL(this.audioProp.src)
    this.isLoading = false
  }

  public toggleSound (): void {
    this.isPlaying = !this.isPlaying
    this.isPlaying ? this.audio.play() : this.audio.pause()
  }

  public close (): void {
    if (this.isPlaying) {
      this.audio.pause()
      this.isPlaying = false
      this.audio = null
    }
    this.closePlayer()
  }

}
