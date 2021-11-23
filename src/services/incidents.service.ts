import { mapAxiosErrorToCustom } from '@rfcx/http-utils'

import * as Endpoints from '@/api/endpoints'
import { Incident, Response, ResponseAsset } from '@/types'
import ApiClient from './api.service'

interface paramsModel {
  streams?: any[]
  projects?: any[]
  closed?: string
  sort?: string
  limit?: number
  offset?: number
}

export async function getIncidents (options: any = {}): Promise<{ data: Incident[], headers: any }> {
  const params: paramsModel = {
    ...options.closed !== undefined && { closed: options.closed },
    ...options.sort !== undefined && { sort: options.sort },
    ...options.limit !== undefined && { limit: options.limit },
    ...options.offset !== undefined && { offset: options.offset }
  }
  if (options.streams !== undefined) {
    params.streams = options.streams
  }
  if (options.projects !== undefined) {
    params.projects = options.projects
  }
  Endpoints.getIncidents.config = {
    params: params
  }
  try {
    const resp = await ApiClient.request<Incident[]>({
      ...Endpoints.getIncidents
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getIncident (id: string): Promise<Incident> {
  try {
    const incidentDetails = Endpoints.getIncidents.url + `/${id}`
    const resp = await ApiClient.request<Incident>({
      method: 'GET',
      url: incidentDetails
    })
    return resp.data
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw mapAxiosErrorToCustom(e)
  }
}

export async function closeIncident (id: string): Promise<Incident[]> {
  try {
    const incident = Endpoints.closeIncident.url + `/${id}`
    const resp = await ApiClient.request<Incident[]>({
      method: 'PATCH',
      url: incident,
      data: { closed: true }
    })
    return resp.data
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getResposesAssets (id: string): Promise<ResponseAsset[]> {
  try {
    const assetsUrl = Endpoints.getResponse.url + `/${id}/assets`
    const resp = await ApiClient.request<ResponseAsset[]>({
      method: 'GET',
      url: assetsUrl
    })
    return resp.data
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getResposeDetails (id: string): Promise<Response> {
  try {
    const assetsUrl = Endpoints.getResponse.url + `/${id}`
    const resp = await ApiClient.request<Response>({
      method: 'GET',
      url: assetsUrl
    })
    return resp.data
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getFiles (id: string, type?: string): Promise<any> {
  try {
    const assetsUrl = Endpoints.getAssets.url + `/${id}`
    const resp = await ApiClient.request<any>({
      method: 'GET',
      url: assetsUrl,
      config: {
        responseType: 'blob'
      }
    })
    return new Blob([resp.data], { type: type })
  } catch (e) {
    return await Promise.reject(e)
  }
}

export function combineIncidentItems (incident: Incident): void {
  incident.items = [
    ...incident.events.map((event: any) => {
      event.type = 'event'
      return event
    }),
    ...incident.responses.map((response: any) => {
      response.type = 'response'
      return response
    })]
  incident.items.sort((a: any, b: any) => {
    const dateA = new Date(a.type === 'event' ? a.start : a.submittedAt).valueOf()
    const dateB = new Date(b.type === 'event' ? b.start : b.submittedAt).valueOf()
    return dateB - dateA
  })
}
