import { Project } from '@/types'

export interface Stream {
  id: string
  name: string
  timezone: string
  countryName: string
  latitude?: number
  longitude?: number
  project?: Project
}
