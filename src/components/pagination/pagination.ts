import { Options, Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit, Prop, Watch } from 'vue-property-decorator'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/solid'

import { Pagination } from '@/types'

@Options({
  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  }
})
export default class PaginationComponent extends Vue {
  @Prop({ default: null })
  paginationSettings!: Pagination

  public lastPage = 0
  public countPagesPerWindow = 0

  @Emit('selectedPage')
  public getSelectedPage (): Pagination {
    return this.paginationSettings
  }

  @Watch('paginationSettings.total')
  onPaginationSettingsChange (): void {
    this.lastPage = 0
    this.initializeSettings()
  }

  data (): Record<string, unknown> {
    return {
      t: useI18n()
    }
  }

  mounted (): void {
    this.initializeSettings()
  }

  public initializeSettings (): void {
    this.lastPage = Math.ceil(this.paginationSettings.total / this.paginationSettings.limit)
    this.countPagesPerWindow = 8
  }

  public pages (): number[] {
    let numShown = this.countPagesPerWindow
    numShown = Math.min(numShown, this.lastPage)
    let first = this.paginationSettings.page - Math.floor(numShown / 2)
    first = Math.max(first, 1)
    first = Math.min(first, this.lastPage - numShown + 1)
    return [...Array(numShown)].map((k, i) => i + first)
  }

  public getPage (page: number): void {
    this.paginationSettings.offset = page - 1
    this.paginationSettings.page = page
    this.select()
  }

  public getNextPage (): void {
    if (this.paginationSettings.page === this.lastPage) {
      this.select()
    } else {
      this.paginationSettings.offset++
      this.paginationSettings.page++
      this.select()
    }
  }

  public getPrevPage (): void {
    if (this.paginationSettings.offset === 0) {
      this.select()
    } else {
      this.paginationSettings.offset--
      this.paginationSettings.page--
      this.select()
    }
  }

  public select (): void {
    this.getSelectedPage()
  }
}
