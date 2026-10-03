export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

export type Notification = {
  _id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export type NotificationList = {
  notifications: Notification[]
  unreadCount: number
}