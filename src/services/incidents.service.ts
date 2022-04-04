import { mapAxiosErrorToCustom } from '@rfcx/http-utils'

import * as Endpoints from '@/api/endpoints'
import { Incident, Response, ResponseAsset } from '@/types'
import ApiClient from './api.service'

interface IncidentQueryParams {
  streams?: string[]
  projects?: string[]
  closed?: boolean
  sort?: string
  limit?: number
  offset?: number
  min_events?: number
  first_event_start?: string
}

export async function getIncidents (params: IncidentQueryParams = {}): Promise<{ data: Incident[], headers: any }> {
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
    const dateA = new Date(a.type === 'event' ? a.start : a.investigatedAt).valueOf()
    const dateB = new Date(b.type === 'event' ? b.start : b.investigatedAt).valueOf()
    return dateB - dateA
  })
}
