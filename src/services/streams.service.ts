import * as Endpoints from '@/api/endpoints'
import { Stream, StreamsWithIncidentsParams } from '@/types'
import ApiClient from './api.service'

export async function getStreams (params: StreamsWithIncidentsParams = {}): Promise<{ data: Stream[], headers: any }> {
  try {
    const resp = await ApiClient.request<Stream[]>({
      method: Endpoints.getStreams.method,
      url: `${Endpoints.getStreams.url}`,
      config: { params: params }
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}

export async function getStream (streamId: string): Promise<{ data: Stream, headers: any }> {
  try {
    const resp = await ApiClient.request<Stream>({
      method: Endpoints.getStreams.method,
      url: `${Endpoints.getStreams.url}/${streamId}`
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
