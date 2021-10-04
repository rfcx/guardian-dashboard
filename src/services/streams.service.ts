import * as Endpoints from '@/api/endpoints'
import rawStreams from '@/api/raw-site-01-07-apr-2021.json'
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

export function getMockupStreams (): StreamModels.Stream[] {
  return rawStreams.map(s => {
    const { name, latitude, longitude } = s
    return {
      id: s.site_id,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude)
    }
  })
}
