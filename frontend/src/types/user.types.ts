export type UserRole = 'Admin' | 'Manager' | 'Viewer'

export type UserStatus = 'Active' | 'Inactive'

export type User = {
  _id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  joinedDate: string
  createdAt: string
  updatedAt: string
}

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role: UserRole
  status?: UserStatus
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  status?: UserStatus
}

export type UsersPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}