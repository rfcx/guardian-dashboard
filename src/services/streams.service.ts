import * as Endpoints from '@/api/endpoints'
import { Stream } from '@/types'
import ApiClient from './api.service'

export async function getStreams (projects?: string[], keyword?: string): Promise<{ data: Stream[], headers: any }> {
  Endpoints.getStreams.config = {
    params: {
      ...projects !== undefined && { projects: projects },
      ...keyword !== undefined && { keyword: keyword },
      limit: 10000
    }
  }
  try {
    const resp = await ApiClient.request<Stream[]>({
      ...Endpoints.getStreams
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
