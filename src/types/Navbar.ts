import { RouteLocationRaw } from 'vue-router'

export interface NavMenu {
  label: string
  destination: RouteLocationRaw
  role?: string[]
}

export interface DropdownItem {
  value: string
  label: string
  checked: boolean
}
