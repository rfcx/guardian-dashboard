import rangerBaseApi from '../../config/index'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Endpoint {
  method: RequestMethod
  url: string
  config?: any
  headers?: any
}

export const getStreams: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/streams`
}

export const getProjects: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/projects`
}

export const getIncidents: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/incidents`
}

export const getResponse: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/responses`
}

export const getAssets: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/assets`
}

export const closeIncident: Endpoint = {
  method: 'PATCH',
  url: `${rangerBaseApi}/incidents`
}

export const getClusteredEvents: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/clustered-events`
}

export const getClusteredDetections: Endpoint = {
  method: 'GET',
  url: `${rangerBaseApi}/clustered-detections`
}
