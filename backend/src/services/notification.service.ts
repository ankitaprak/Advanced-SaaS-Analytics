import Notification from "../models/Notification.js";

export type NotificationType = "info" | "success" | "warning" | "error";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

export const createNotificationForUser = async ({
  userId,
  title,
  message,
  type = "info",
}: CreateNotificationInput) => {
  return Notification.create({
    userId,
    title,
    message,
    type,
  });
};
