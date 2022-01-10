import * as Endpoints from '@/api/endpoints'
import { Stream, StreamsWithIncidentsParams } from '@/types'
import ApiClient from './api.service'

export async function getStreams (projects?: string[], keyword?: string): Promise<{ data: Stream[], headers: any }> {
  Endpoints.getStreams.config = { params: { projects, keyword, limit: 10000 } }
  try {
    const resp = await ApiClient.request<Stream[]>({
      ...Endpoints.getStreams
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getStreamsWithIncidents (params: StreamsWithIncidentsParams = {}): Promise<{ data: Stream[], headers: any }> {
  try {
    const resp = await ApiClient.request<Stream[]>({
      method: Endpoints.getStreams.method,
      url: `${Endpoints.getStreams.url}/incidents`,
      config: { params: params }
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
