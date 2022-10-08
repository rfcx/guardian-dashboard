import { Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'

export default class FooterComponent extends Vue {
  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }
}
