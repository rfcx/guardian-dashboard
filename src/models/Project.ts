/* eslint-disable camelcase */
export interface RawProjectListItem {
  id: string
  name: string
  isPublic: boolean
  externalId: number
}
/* eslint-enable camelcase */

export interface ProjectListItem {
  id?: string
  name?: string
  isPublic?: boolean
  externalId?: number
}
