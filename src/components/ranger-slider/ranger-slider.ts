import { Options, Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

import { RawImageItem } from '@/models'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerSliderComponent extends Vue {
  @Prop({ default: [] })
  imagesProps!: RawImageItem[]

  public isLoading = false
  public currentIndex = 0
  public images: RawImageItem[] = []

  @Watch('imagesProps')
  onImagesPropsChange (): void {
    this.isLoading = true
    this.getSourceFiles()
  }

  @Emit('closeSlider')
  public closeSlider (): boolean {
    return true
  }

  mounted (): void {
    this.isLoading = true
    this.getSourceFiles()
  }

  public getSourceFiles (): void {
    this.isLoading = false
    this.images = this.imagesProps
    this.getImage(this.currentIndex)
  }

  public getNextImage (): void {
    let index = this.currentIndex
    console.log('getNextImage', index++ > this.images.length - 1)
    index++ > this.images.length - 1 ? this.getImage(this.currentIndex = 0) : this.getImage(this.currentIndex++)
  }

  public getPrevImage (): void {
    let index = this.currentIndex
    index-- === 0 ? this.getImage(this.currentIndex = this.images.length - 1) : this.getImage(this.currentIndex--)
  }

  public getImage (i: number): RawImageItem {
    if (this.images[i] !== undefined) {
      return this.images[0]
    } else return this.images[i]
  }

  public close (): void {
    this.closeSlider()
  }
}
