import * as Endpoints from '@/api/endpoints'
import { Stream } from '@/models'
import ApiClient from './api.service'

export async function getStreams (projectsId: any): Promise<Stream[]> {
  if (projectsId !== undefined) {
    Endpoints.getStreams.config = {
      params: { projects: projectsId }
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
