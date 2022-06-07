import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'

import NavigationBarComponent from '@/components/navbar/navbar.vue'

@Options({
  components: {
    'nav-bar': NavigationBarComponent
  }
})

export default class AnalyticsPage extends Vue {
  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }
}
