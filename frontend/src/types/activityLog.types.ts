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