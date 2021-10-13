import * as Endpoints from '@/api/endpoints'
import { IncidentModel } from '@/models'
import ApiClient from './api.service'

interface paramsModel {
  streams?: Array<any>,
  projects?: Array<any>,
  closed?: string,
  sort?: string,
  limit?: number,
  offset?: number
}

export async function getIncidents (options: any): Promise<IncidentModel.Incident[]> {
  let params: paramsModel = {
    ...!!options.closed !== undefined && { closed: options.closed },
    ...!!options.sort !== undefined && { sort: options.sort },
    ...!!options.limit !== undefined && { limit: options.limit },
    ...!!options.offset !== undefined && { offset: options.offset },
  }
  if (options.streams) {
    params.streams = options.streams
  };
  if (options.projects) {
    params.projects = options.projects
  };
  Endpoints.getIncidents.config = {
    params: params
  }
  try {
    const resp = await ApiClient.request<IncidentModel.Incident[]>({
      ...Endpoints.getIncidents
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getIncident (id: any): Promise<IncidentModel.Incident[]> {
  try {
    const incidentDetails = Endpoints.getIncidents.url + `/${id}`
    const resp = await ApiClient.request<IncidentModel.Incident[]>({
      method: 'GET',
      url: incidentDetails
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function closeIncident (id: any): Promise<IncidentModel.Incident[]> {
  try {
    const incident = Endpoints.closeIncident.url + `/${id}`
    const resp = await ApiClient.request<IncidentModel.Incident[]>({
      method: 'PATCH',
      url: incident,
      data: { closed: true }
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getResposesAssets (id: any): Promise<any> {
  try {
    const assetsUrl = Endpoints.getResponse.url + `/${id}/assets`
    const resp = await ApiClient.request<any>({
      method: 'GET',
      url: assetsUrl
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getResposeDetails (id: any): Promise<any> {
  try {
    const assetsUrl = Endpoints.getResponse.url + `/${id}`
    const resp = await ApiClient.request<any>({
      method: 'GET',
      url: assetsUrl
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getFiles (id: any): Promise<any> {
  try {
    const assetsUrl = Endpoints.getAssets.url + `/${id}`
    const resp = await ApiClient.request<any>({
      method: 'GET',
      url: assetsUrl,
      config: {
        responseType: 'blob'
      }
    })
    return new Blob([resp])
  } catch (e) {
    return await Promise.reject(e)
  }
}

export function combineIncidentItems (incident: any) {
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
    const dateA = new Date(a.type === 'event' ? a.createdAt : a.submittedAt).valueOf()
    const dateB = new Date(b.type === 'event' ? b.createdAt : b.submittedAt).valueOf()
    return dateB - dateA
  })

}
