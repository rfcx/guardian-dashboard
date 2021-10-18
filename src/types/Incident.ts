export interface Incident {
  id: string
  createdAt: string
  closedAt?: string
  ref?: number
  streamId: string
  projectId: string
  closedBy?: any
  events: any[]
  responses: any[]
  items: any[]
}

export interface ResponseAsset {
  id: string
  fileName: string
  mimeType: string
  response: {
    id: string
  }
  createdBy: {
    firstname: string
    lastname: string
    guid: string
    email: string
  }
  createdAt: string
}

export interface Response {
  id: string
  investigatedAt: string
  startedAt: string
  submittedAt: string
  createdAt: string
  createdBy: {
    firstname: string
    lastname: string
    guid: string
    email: string
  }
  loggingScale: number
  damageScale: number
  evidences: any[]
  actions: any[]
  incident: {
    id: string
    createdAt: string
    closedAt: string
    ref: number
    streamId: string
    projectId: string
  }
  type: string
  showNotes: boolean
  showSlider: boolean
  showTrack: boolean
  showPlayer: boolean
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
