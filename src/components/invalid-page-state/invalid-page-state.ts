import { Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Prop } from 'vue-property-decorator'

export default class InvalidPageStateComponent extends Vue {
  @Prop({ default: null })
  message!: string

  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }
}
