import type {
  Request,
  Response,
} from 'express'

import Notification from '../models/Notification.js'

export const getNotifications =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const notifications =
        await Notification.find({
          userId,
        })
          .sort({
            createdAt: -1,
          })
          .limit(20)
          .lean()

      const unreadCount =
        await Notification.countDocuments({
          userId,
          isRead: false,
        })

      res.status(200).json({
        success: true,
        message:
          'Notifications fetched successfully',
        data: {
          notifications,
          unreadCount,
        },
      })
    } catch (error) {
      console.error(
        'Get notifications error:',
        error,
      )

      res.status(500).json({
        success: false,
        message:
          'Failed to fetch notifications',
      })
    }
  }

export const markNotificationAsRead =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId = req.user?.userId
      const { id } = req.params

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: id,
            userId,
          },
          {
            isRead: true,
          },
          {
            new: true,
          },
        )

      if (!notification) {
        res.status(404).json({
          success: false,
          message:
            'Notification not found',
        })
        return
      }

      res.status(200).json({
        success: true,
        message:
          'Notification marked as read',
        data: notification,
      })
    } catch (error) {
      console.error(
        'Mark notification read error:',
        error,
      )

      res.status(500).json({
        success: false,
        message:
          'Failed to update notification',
      })
    }
  }

export const markAllNotificationsAsRead =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const userId = req.user?.userId

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      await Notification.updateMany(
        {
          userId,
          isRead: false,
        },
        {
          isRead: true,
        },
      )

      res.status(200).json({
        success: true,
        message:
          'All notifications marked as read',
      })
    } catch (error) {
      console.error(
        'Mark all notifications read error:',
        error,
      )

      res.status(500).json({
        success: false,
        message:
          'Failed to update notifications',
      })
    }
  }

export const createNotification =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        userId,
        title,
        message,
        type,
      } = req.body

      if (
        !userId ||
        !title ||
        !message
      ) {
        res.status(400).json({
          success: false,
          message:
            'userId, title and message are required',
        })
        return
      }

      const notification =
        await Notification.create({
          userId,
          title,
          message,
          type: type || 'info',
        })

      res.status(201).json({
        success: true,
        message:
          'Notification created successfully',
        data: notification,
      })
    } catch (error) {
      console.error(
        'Create notification error:',
        error,
      )

      res.status(500).json({
        success: false,
        message:
          'Failed to create notification',
      })
    }
  }