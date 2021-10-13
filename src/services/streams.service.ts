import * as Endpoints from '@/api/endpoints'
import { StreamModels } from '@/models'
import ApiClient from './api.service'

export async function getStreams (projectsId: any): Promise<StreamModels.Stream[]> {
  if (projectsId) {
    Endpoints.getStreams.config = {
      params: { projects: projectsId }
    }
  }
  try {
    const resp = await ApiClient.request<StreamModels.Stream[]>({
      ...Endpoints.getStreams
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
