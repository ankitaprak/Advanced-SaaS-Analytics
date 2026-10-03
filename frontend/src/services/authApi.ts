import api from './api'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginUser = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Viewer'
}

export type LoginResponse = {
  success: boolean
  message: string
  data: {
    token: string
    user: LoginUser
  }
}

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    payload,
  )

  return response.data
}