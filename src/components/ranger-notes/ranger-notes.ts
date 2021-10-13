import { Vue, Options } from 'vue-class-component'
import { OnClickOutside } from '@vueuse/components'
import { Emit, Prop, Watch } from 'vue-property-decorator'

@Options({
  components: {
    OnClickOutside
  }
})
export default class RangerNotes extends Vue {

  @Prop({ default: [] })
  notes!: Array<any> | []

  public isLoading: boolean = false

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
