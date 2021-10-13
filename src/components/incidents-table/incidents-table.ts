import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { formatDayLabel, formatTimeLabel } from '@/utils'

export default class IncidentsTableRows extends Vue {

  @Prop({ default: null })
  timezone!: string
  @Prop({ default: [] })
  items!: Array<any>
  @Prop({ default: '' })
  itemsLabel!: string

  public dateFormatted (date: string): string {
    return formatDayLabel(date, this.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.timezone)
  }

  public isEvent (item: any) {
    return item.type === 'event'
  }

}
