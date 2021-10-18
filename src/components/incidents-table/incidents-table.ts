import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { EventExtended, ResponseExtended } from '@/types'
import { formatDayTimeLabel, formatTimeLabel } from '@/utils'

interface IncidentItem extends EventExtended, ResponseExtended {}

export default class IncidentsTableRows extends Vue {
  @Prop({ default: null })
  timezone!: string

  @Prop({ default: [] })
  itemsData!: IncidentItem[]

  public dateFormatted (date: string): string {
    return formatDayTimeLabel(date, this.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.timezone)
  }

  public isEvent (item: IncidentItem): boolean {
    return item.type === 'event'
  }
}
