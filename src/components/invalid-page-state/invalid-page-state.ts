import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

export default class InvalidPageStateComponent extends Vue {
  @Prop({ default: null })
  message!: string
}
