import { Vue } from 'vue-class-component'
import { useI18n } from 'vue-i18n'
import { Emit, Prop } from 'vue-property-decorator'

import { DropdownItem } from '@/types'

export default class NavbarDropdownComponent extends Vue {
  @Prop({ default: null })
  items!: DropdownItem[]

  @Prop({ default: '' })
  dropdownImageTitle!: string

  @Prop({ default: '' })
  dropdownImage!: string

  @Prop({ default: '' })
  customClass!: string

  @Prop({ default: '' })
  customStyle!: string

  @Emit('selectedItem')
  public getSelectedItem (): string | undefined {
    const item = this.items.find(item => item.checked)
    return item?.value
  }

  public itemSelected = true

  data (): Record<string, unknown> {
    return {
      items: this.items,
      t: useI18n()
    }
  }

  public onItemChanged (item: DropdownItem): void {
    this.items.forEach((i: DropdownItem) => { i.checked = false })
    item.checked = true
    this.getSelectedItem()
  }

  public toggleItems (): void {
    this.itemSelected = !this.itemSelected
  }
}
