import api from './api'

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'export'

export type ActivityModule =
  | 'user'
  | 'transaction'
  | 'notification'
  | 'report'
  | 'analytics'
  | 'dashboard'

export type ActivityUser = {
  _id: string
  name: string
  email: string
  role: string
}

export type ActivityLog = {
  _id: string
  userId: ActivityUser
  action: ActivityAction
  module: ActivityModule
  description: string
  createdAt: string
  updatedAt: string
}

export type GetActivityLogsParams = {
  module?: string
  action?: string
  page?: number
  limit?: number
}

export type ActivityLogsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ActivityLogsResponse = {
  success: boolean
  message: string
  data: ActivityLog[]
  pagination: ActivityLogsPagination
}

export const getActivityLogs = async (
  params?: GetActivityLogsParams,
): Promise<ActivityLogsResponse> => {
  const response =
    await api.get<ActivityLogsResponse>(
      '/activity-logs',
      {
        params,
      },
    )

  return response.data
}