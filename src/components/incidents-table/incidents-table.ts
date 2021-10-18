import { Vue } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { Event, Response } from '@/types'
import { formatDayTimeLabel, formatTimeLabel } from '@/utils'

interface ItemsTypes extends Event, Response {}

export default class IncidentsTableRows extends Vue {
  @Prop({ default: null })
  timezone!: string

  @Prop({ default: [] })
  itemsData!: ItemsTypes[]

  public dateFormatted (date: string): string {
    return formatDayTimeLabel(date, this.timezone)
  }

  public timeFormatted (date: string): string {
    return formatTimeLabel(date, this.timezone)
  }

  public isEvent (item: ItemsTypes): boolean {
    return item.type === 'event'
  }
}
