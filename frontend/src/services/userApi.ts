import api from './api'
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UsersPagination,
} from '../types/user.types'

export type GetUsersParams = {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export type UsersResponse = {
  success: boolean
  message: string
  data: User[]
  pagination: UsersPagination
}

export type UserResponse = {
  success: boolean
  message: string
  data: User
}

export type DeleteUserResponse = {
  success: boolean
  message: string
}

export const getUsers = async (
  params?: GetUsersParams,
): Promise<UsersResponse> => {
  const response = await api.get<UsersResponse>('/users', {
    params,
  })

  return response.data
}

export const createUser = async (
  payload: CreateUserPayload,
): Promise<UserResponse> => {
  const response = await api.post<UserResponse>(
    '/users',
    payload,
  )

  return response.data
}

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(
    `/users/${id}`,
    payload,
  )

  return response.data
}

export const deleteUser = async (
  id: string,
): Promise<DeleteUserResponse> => {
  const response = await api.delete<DeleteUserResponse>(
    `/users/${id}`,
  )

  return response.data
}