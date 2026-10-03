import type { Request, Response } from 'express'
import { Transaction } from '../models/Transaction.js'
import User from '../models/User.js'

export const getAnalyticsSummary = async (
  req: Request,
  res: Response,
) => {
  try {
    const range = String(req.query.range || '30')

    const allowedRanges = ['7', '30', '90', '365']

    if (!allowedRanges.includes(range)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date range',
      })
      return
    }

    const days = Number(range)

    const startDate = new Date()

    startDate.setDate(
      startDate.getDate() - days,
    )

    const dateFilter = {
      $gte: startDate,
      $lte: new Date(),
    }

    const [
      totalUsers,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
    ] = await Promise.all([
      User.countDocuments({
        createdAt: dateFilter,
      }),

      Transaction.countDocuments({
        date: dateFilter,
      }),

      Transaction.countDocuments({
        date: dateFilter,
        status: 'completed',
      }),

      Transaction.countDocuments({
        date: dateFilter,
        status: 'pending',
      }),

      Transaction.countDocuments({
        date: dateFilter,
        status: 'failed',
      }),
    ])

    const revenueResult =
      await Transaction.aggregate([
        {
          $match: {
            date: dateFilter,
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: '$amount',
            },
          },
        },
      ])

    const revenue =
      revenueResult[0]?.revenue || 0

    const averageTransactionValue =
      completedTransactions > 0
        ? revenue / completedTransactions
        : 0

    const completionRate =
      totalTransactions > 0
        ? (completedTransactions /
            totalTransactions) *
          100
        : 0

    res.status(200).json({
      success: true,
      message: 'Analytics summary fetched successfully',
      data: {
        totalUsers,
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        revenue,
        averageTransactionValue,
        completionRate,
      },
    })
  } catch (error) {
    console.error(
      'Analytics summary error:',
      error,
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary',
    })
  }
}


export const getUserAnalytics = async (
  req: Request,
  res: Response,
) => {
  try {
    const range = String(req.query.range || '30')

    const allowedRanges = ['7', '30', '90', '365']

    if (!allowedRanges.includes(range)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date range',
      })
      return
    }

    const days = Number(range)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const endDate = new Date()

    const users = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          newUsers: {
            $sum: 1,
          },
          activeUsers: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Active'] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])

    const data = users.map((item) => ({
      date: item._id,
      newUsers: item.newUsers,
      activeUsers: item.activeUsers,
    }))

    res.status(200).json({
      success: true,
      message: 'User analytics fetched successfully',
      data,
    })
  } catch (error) {
    console.error('User analytics error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
    })
  }
}


export const getConversionFunnel = async (
  req: Request,
  res: Response,
) => {
  try {
    const range = String(req.query.range || '30')

    const allowedRanges = ['7', '30', '90', '365']

    if (!allowedRanges.includes(range)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date range',
      })
      return
    }

    const days = Number(range)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const endDate = new Date()

    const [
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
    ] = await Promise.all([
      Transaction.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }),

      Transaction.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        status: 'completed',
      }),

      Transaction.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        status: 'pending',
      }),

      Transaction.countDocuments({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
        status: 'failed',
      }),
    ])

    res.status(200).json({
      success: true,
      message: 'Conversion funnel fetched successfully',
      data: [
        {
          stage: 'Total Transactions',
          users: totalTransactions,
        },
        {
          stage: 'Completed',
          users: completedTransactions,
        },
        {
          stage: 'Pending',
          users: pendingTransactions,
        },
        {
          stage: 'Failed',
          users: failedTransactions,
        },
      ],
    })
  } catch (error) {
    console.error('Conversion funnel error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion funnel',
    })
  }
}