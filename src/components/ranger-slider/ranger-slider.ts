import { Vue, Options } from 'vue-class-component'
import { OnClickOutside } from '@vueuse/components'
import { Emit, Prop, Watch } from 'vue-property-decorator'
import { RawImageItem } from '@/models'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerSliderComponent extends Vue {

  @Prop({ default: [] })
  imagesProps!: RawImageItem[]

  public isLoading: boolean = false
  public currentIndex: number = 0
  public images: Array<any> = []

  @Watch('imagesProps')
  onImagesPropsChange (): void {
    this.isLoading = true
    if (this.imagesProps) {
      this.getSourceFiles()
    }
  }

  @Emit('closeSlider')
  public closeSlider (): any {
    return { key: 'slider', toggle: false }
  }

  mounted (): void {
    this.isLoading = true
    if (this.imagesProps) {
      this.getSourceFiles()
    }
  }

  public getSourceFiles(): void {
    this.isLoading = false
    this.images = this.imagesProps
    this.getImage(this.currentIndex)
  }

  public getNextImage (): any {
    let index = this.currentIndex
    console.log('getNextImage', index++ > this.images.length-1)
    index++ > this.images.length-1 ? this.getImage(this.currentIndex=0) : this.getImage(this.currentIndex++)
  }

  public getPrevImage (): any {
    let index = this.currentIndex
    index-- === 0 ? this.getImage(this.currentIndex=this.images.length-1) : this.getImage(this.currentIndex--)
  }

  public getImage (i: number): any {
    if (!this.images[i]) {
      return this.images[0]
    }
    else return this.images[i]
  }

  public close (): void {
    this.closeSlider()
  }

}
