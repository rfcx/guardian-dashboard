import * as Endpoints from '@/api/endpoints'
import { Clustered, ClusteredRequest } from '@/types'
import ApiClient from './api.service'

export async function getClusteredEvents (params?: ClusteredRequest): Promise<{ data: Clustered[], headers: any }> {
  try {
    const resp = await ApiClient.request<Clustered[]>({
      method: Endpoints.getClusteredEvents.method,
      url: `${Endpoints.getClusteredEvents.url}`,
      config: { params: params }
    })
    return resp
  } catch (error) {
    return await Promise.reject(error)
  }
}
