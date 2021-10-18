export interface Incident {
  id: string
  createdAt: string
  closedAt?: string
  ref?: number
  streamId: string
  projectId: string
  closedBy?: User
  events: Event[]
  responses: Response[]
  items: any[]
}

export interface IncidentLite {
  id: string
  createdAt: string
  closedAt: string
  ref: number
  streamId: string
  projectId: string
}

export interface ResponseAsset {
  id: string
  fileName: string
  mimeType: string
  response: {
    id: string
  }
  createdBy: User
  createdAt: string
}

export interface User {
  firstname: string
  lastname: string
  guid: string
  email: string
}

export interface Response {
  id: string
  investigatedAt: string
  startedAt: string
  submittedAt: string
  createdAt: string
  createdBy: User
  loggingScale: number
  damageScale: number
  evidences: string[]
  actions: string[]
  incident: IncidentLite
  type: string
  showNotes: boolean
  showSlider: boolean
  showTrack: boolean
  showPlayer: boolean
  assetsData: any[]
  sliderData: any[]
  notesData: string[]
  audioObject: any
  messages: any
}

export interface Event {
  id: string
  start: string
  end: string
  createdAt: string
  classification: {
    value: string
    title: string
  }
  type: string
}
