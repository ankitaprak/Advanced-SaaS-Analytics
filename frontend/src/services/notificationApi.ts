import api from "./api";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error";

export type Notification = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsResponse = {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
};

export type NotificationResponse = {
  success: boolean;
  message: string;
  data: Notification;
};

export type MarkAllReadResponse = {
  success: boolean;
  message: string;
};

export type CreateNotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response = await api.get<NotificationsResponse>("/notifications");

  return response.data;
};

export const createNotification = async (
  payload: CreateNotificationPayload,
): Promise<NotificationResponse> => {
  const response = await api.post<NotificationResponse>(
    "/notifications",
    payload,
  );

  return response.data;
};

export const markNotificationAsRead = async (
  id: string,
): Promise<NotificationResponse> => {
  const response = await api.patch<NotificationResponse>(
    `/notifications/${id}/read`,
  );

  return response.data;
};

export const markAllNotificationsAsRead =
  async (): Promise<MarkAllReadResponse> => {
    const response = await api.patch<MarkAllReadResponse>(
      "/notifications/read-all",
    );

    return response.data;
};