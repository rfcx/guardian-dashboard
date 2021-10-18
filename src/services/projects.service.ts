import * as Endpoints from '@/api/endpoints'
import { Project } from '@/models'
import ApiClient from './api.service'

interface ProjectRequest {
  limit?: number
  offset?: number
  keyword?: string
}

function mapProjectList (data: Project): Project {
  return {
    id: data.id,
    name: data.name,
    isPublic: data.isPublic,
    externalId: data.externalId
  }
}

export async function getProjects (options?: ProjectRequest): Promise<Project[]> {
  try {
    const resp = await ApiClient.request<Project[]>({
      ...Endpoints.getProjects
    })
    return Array.isArray(resp) ? resp.map(d => mapProjectList(d)) : []
  } catch (error) {
    return await Promise.reject(error)
  }
}
