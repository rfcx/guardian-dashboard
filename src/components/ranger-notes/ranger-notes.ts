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
  notes!: any[] | []

  public isLoading = false

  @Watch('notes')
  onNotesChange (): void {
    this.isLoading = true
    if (this.notes) {
      this.isLoading = false
    }
  }

  @Emit('closeNotes')
  public closeNotes (): any {
    return { key: 'notes', toggle: false }
  }

  mounted (): void {
    this.isLoading = true
    if (this.notes) {
      this.isLoading = false
    }
  }

  public close (): void {
    this.closeNotes()
  }
}
