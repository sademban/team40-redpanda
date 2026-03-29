export interface AuthUser {
  id: string
  handle: string
  email: string | null
  isPersistent: boolean
}

export interface AuthSession {
  token: string
  user: AuthUser
}
