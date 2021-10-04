import CORE from '../../config/rfcx.json'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Endpoint {
  method: RequestMethod
  url: string
  config?: any
}

export const getStreams: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/streams`
}

export const getProjects: Endpoint = {
  method: 'GET',
  url: `${CORE.rangerBaseApi}/projects`
}
