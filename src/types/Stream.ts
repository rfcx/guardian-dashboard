import { Incident, Project } from '@/types'

export interface Stream {
  id: string
  name: string
  timezone: string
  countryName: string
  latitude?: number
  longitude?: number
  project?: Project
  incidents?: Incident[]
  loading?: boolean
}

export interface StreamsWithIncidentsParams {
  projects?: string[]
  incidents_closed?: boolean
  sort?: string
  limit?: number
  offset?: number
  incidents_min_events?: number
  keyword?: string
  limit_incidents?: number
  fields?: string
}
