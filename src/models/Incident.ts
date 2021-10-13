export interface Incident {
  id: string
  createdAt: string
  closedAt?: string
  ref?: number
  stream_id: string
  project_id: string
  closedBy?: any
  events?: Array<any>
  responses?: Array<any>
}
