import { Incident, Project } from '@/types'

export interface Stream {
  id: string
  name: string
  timezone: string
  countryName: string
  latitude?: number
  longitude?: number
  project?: Project
  incidents?: IncidentsObject
  tags?: string[]
}

export interface StreamStatus {
  id: string
  label: string
  checked: boolean
}

export interface IncidentsObject {
  items: Incident[]
  total: number
}

export interface StreamsWithIncidentsParams {
  projects?: string[]
  streams?: string[]
  limit?: number
  offset?: number
  keyword?: string
  limit_incidents?: number
  fields?: string
  include_closed_incidents?: boolean
  has_new_events?: boolean
  has_hot_incident?: boolean
}
