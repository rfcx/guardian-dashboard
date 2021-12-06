import * as Endpoints from '@/api/endpoints'
import { Stream } from '@/types'
import ApiClient from './api.service'

export async function getStreams (projects?: string[]): Promise<Stream[]> {
  Endpoints.getStreams.config = {
    params: {
      ...projects !== undefined && { projects: projects },
      limit: 10000
    }
  }
  try {
    const resp = await ApiClient.request<Stream[]>({
      ...Endpoints.getStreams
    })
    return resp.data
  } catch (e) {
    return await Promise.reject(e)
  }
}
