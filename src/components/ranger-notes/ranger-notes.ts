import { Options, Vue } from 'vue-class-component'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { OnClickOutside } from '@vueuse/components'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerNotes extends Vue {
  @Prop({ default: [] })
  notes!: string[]

  public isLoading = false

  @Watch('notes')
  onNotesChange (): void {
    this.isLoading = true
    this.isLoading = false
  }

  @Emit('closeNotes')
  public closeNotes (): boolean {
    return true
  }

  mounted (): void {
    this.isLoading = true
    this.isLoading = false
  }

  public close (): void {
    this.closeNotes()
  }
}
