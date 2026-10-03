import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  createNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

import { authorize } from "../middleware/role.middleware.js";

const router = Router()

router.get('/', protect, getNotifications,)

router.post(
  '/', protect,
  authorize('Admin', 'Manager'),
  createNotification,
)

router.patch('/read-all', protect, markAllNotificationsAsRead,)

router.patch('/:id/read', protect, markNotificationAsRead,)

export default router