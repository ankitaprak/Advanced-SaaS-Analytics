import type { Request, Response } from 'express'
import { Transaction } from '../models/Transaction.js'
import User from '../models/User.js'

export const getDashboardSummary = async (
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

    const transactionDateFilter = {
      date: {
        $gte: startDate,
        $lte: new Date(),
      },
    }

    const [
      totalUsers,
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
    ] = await Promise.all([
      User.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: new Date(),
        },
      }),

      Transaction.countDocuments(
        transactionDateFilter,
      ),

      Transaction.countDocuments({
        ...transactionDateFilter,
        status: 'completed',
      }),

      Transaction.countDocuments({
        ...transactionDateFilter,
        status: 'pending',
      }),

      Transaction.countDocuments({
        ...transactionDateFilter,
        status: 'failed',
      }),
    ])

    const revenueResult =
      await Transaction.aggregate([
        {
          $match: {
            ...transactionDateFilter,
            status: 'completed',
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: '$amount',
            },
          },
        },
      ])

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0

    res.status(200).json({
      success: true,
      message:
        'Dashboard summary fetched successfully',
      data: {
        totalUsers,
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error(
      'Dashboard summary error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch dashboard summary',
    })
  }
}

export const getRevenueChart = async (
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

    const revenueData =
      await Transaction.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: new Date(),
            },
            status: 'completed',
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$date',
              },
            },
            revenue: {
              $sum: '$amount',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])

    const data = revenueData.map((item) => ({
      date: item._id,
      revenue: item.revenue,
    }))

    res.status(200).json({
      success: true,
      message: 'Revenue chart data fetched successfully',
      data,
    })
  } catch (error) {
    console.error(
      'Revenue chart error:',
      error,
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue chart data',
    })
  }
}


export const getUserGrowthChart = async (
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

    const userGrowthData =
      await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: new Date(),
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
            users: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])

    const data = userGrowthData.map((item) => ({
      date: item._id,
      users: item.users,
    }))

    res.status(200).json({
      success: true,
      message: 'User growth chart data fetched successfully',
      data,
    })
  } catch (error) {
    console.error(
      'User growth chart error:',
      error,
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user growth chart data',
    })
  }
}


export const getTrafficChart = async (
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

    const trafficData =
      await Transaction.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$date',
              },
            },
            transactions: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])

    const data = trafficData.map((item) => ({
      date: item._id,
      transactions: item.transactions,
    }))

    res.status(200).json({
      success: true,
      message: 'Traffic chart data fetched successfully',
      data,
    })
  } catch (error) {
    console.error(
      'Traffic chart error:',
      error,
    )

    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic chart data',
    })
  }
}