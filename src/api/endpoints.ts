import CORE from '../../config/rfcx.json'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Endpoint {
  method: RequestMethod
  url: string
  config?: any
  headers?: any
}

export const getStreams: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/streams`
}

export const getProjects: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/projects`
}

export const getIncidents: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/incidents`
}

export const getResponse: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/responses`
}

export const getAssets: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/assets`
}

export const closeIncident: Endpoint = {
  method: 'PATCH',
  url: `${CORE.rangerBaseApi}/incidents`
}
