import * as Endpoints from '@/api/endpoints'
import { Stream } from '@/types'
import ApiClient from './api.service'

export async function getStreams (projects?: string[]): Promise<Stream[]> {
  if (projects !== undefined) {
    Endpoints.getStreams.config = {
      params: { projects: projects }
    }
  } else {
    delete Endpoints.getStreams.config
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
