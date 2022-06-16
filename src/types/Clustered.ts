export interface Clustered {
  timeBucket: string
  aggregatedValue: number
  firstStart: string
  lastStart: string
  classification: Classification
}

export interface Classification {
  value: string
  title: string
  image?: string
}

export interface ClusteredRequest {
  start: string
  end: string
  streams: string[]
  interval: string
}
