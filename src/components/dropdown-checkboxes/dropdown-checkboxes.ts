import { Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit, Prop } from 'vue-property-decorator'

import { DropdownItem } from '@/types'

export default class DropdownCheckboxes extends Vue {
  @Prop({ default: null })
  items!: DropdownItem[]

  @Prop({ default: '' })
  dropdownTitle!: string

  @Prop({ default: '' })
  dropdownValue!: string

  @Prop({ default: '' })
  dropdownImage!: string

  @Prop({ default: '' })
  customClass!: string

  @Prop({ default: '' })
  customStyle!: string

  @Emit('selectedItem')
  public getSelectedItem (): DropdownItem[] | undefined {
    const items = this.items.filter(item => item.checked)
    return items
  }

  public itemSelected = false

  data (): Record<string, unknown> {
    return {
      items: this.items,
      t: useI18n()
    }
  }

  public onItemChanged (item: DropdownItem): void {
    // this.items.forEach((i: DropdownItem) => { i.checked = false })
    item.checked = !item.checked
    this.getSelectedItem()
  }

  public toggleItems (): void {
    this.itemSelected = !this.itemSelected
  }
}
