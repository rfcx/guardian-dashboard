import { User } from '../types'

export const formatUserName = (user: User | null | undefined): string => {
  if (user === null || user === undefined) {
    return 'unknown user'
  }
  const { firstname, lastname, email } = user
  return (firstname !== undefined && lastname !== undefined) ? `${firstname} ${lastname}` : email
}
