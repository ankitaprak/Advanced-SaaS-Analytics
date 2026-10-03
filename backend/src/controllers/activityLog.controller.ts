import type { Request, Response } from 'express'

import ActivityLog from '../models/ActivityLog.js'

export const getActivityLogs = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      module,
      action,
      page = '1',
      limit = '10',
    } = req.query

    const pageNumber = Math.max(
      Number(page) || 1,
      1,
    )

    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      50,
    )

    const filter: Record<string, unknown> = {}

    if (module) {
      filter.module = module
    }

    if (action) {
      filter.action = action
    }

    const skip =
      (pageNumber - 1) * limitNumber

    const [logs, total] =
      await Promise.all([
        ActivityLog.find(filter)
          .populate(
            'userId',
            'name email role',
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber),

        ActivityLog.countDocuments(filter),
      ])

    const totalPages = Math.ceil(
      total / limitNumber,
    )

    res.status(200).json({
      success: true,
      message:
        'Activity logs fetched successfully',
      data: logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error(
      'Get activity logs error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch activity logs',
    })
  }
}