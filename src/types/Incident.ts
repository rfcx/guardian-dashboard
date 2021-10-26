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
  items: Array<ResponseExtended | EventExtended>
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
  answers: Answer[]
  incident: IncidentLite
}

export interface Answer {
  question: AnswerItem
  items: AnswerItem[]
}

export interface AnswerItem {
  id: number
  text: string
}

export interface ResponseExtended extends Response {
  type: string
  showNotes: boolean
  showSlider: boolean
  showTrack: boolean
  showPlayer: boolean
  assetsData: any[]
  sliderData: any[]
  trackData: any
  notesData: string[]
  audioObject: any
  messages: any
  isDownloading: boolean
  isError: boolean
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
}

export interface EventExtended extends Event {
  type: string
}
