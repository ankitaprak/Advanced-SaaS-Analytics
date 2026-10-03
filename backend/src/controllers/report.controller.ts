import type { Request, Response } from 'express'
import { Transaction } from '../models/Transaction.js'
import User from '../models/User.js'

const getDateFilter = (range: string) => {
  const allowedRanges = ['7', '30', '90', '365']

  if (!allowedRanges.includes(range)) {
    return null
  }

  const days = Number(range)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const endDate = new Date()

  return {
    $gte: startDate,
    $lte: endDate,
  }
}

export const getReportSummary = async (
  req: Request,
  res: Response,
) => {
  try {
    const range = String(req.query.range || '30')

    const dateFilter = getDateFilter(range)

    if (!dateFilter) {
      res.status(400).json({
        success: false,
        message: 'Invalid date range',
      })
      return
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

    const revenueResult = await Transaction.aggregate([
      {
        $match: {
          date: dateFilter,
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

    const averageTransactionValue =
      completedTransactions > 0
        ? totalRevenue / completedTransactions
        : 0

    res.status(200).json({
      success: true,
      message: 'Report summary fetched successfully',
      data: {
        totalUsers,
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        totalRevenue,
        averageTransactionValue,
      },
    })
  } catch (error) {
    console.error('Report summary error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch report summary',
    })
  }
}

export const generateReport = async (
  req: Request,
  res: Response,
) => {
  try {
    const range = String(req.query.range || '30')

    const dateFilter = getDateFilter(range)

    if (!dateFilter) {
      res.status(400).json({
        success: false,
        message: 'Invalid date range',
      })
      return
    }

    const [
      transactions,
      users,
    ] = await Promise.all([
      Transaction.find({
        date: dateFilter,
      })
        .select(
          'transactionId customer amount status paymentMethod date',
        )
        .sort({ date: -1 })
        .lean(),

      User.find({
        createdAt: dateFilter,
      })
        .select(
          'name email role status joinedDate createdAt',
        )
        .sort({ createdAt: -1 })
        .lean(),
    ])

    const completedTransactions =
      transactions.filter(
        (transaction) =>
          transaction.status === 'completed',
      )

    const totalRevenue =
      completedTransactions.reduce(
        (total, transaction) =>
          total + transaction.amount,
        0,
      )

    const averageTransactionValue =
      completedTransactions.length > 0
        ? totalRevenue /
          completedTransactions.length
        : 0

    res.status(200).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        range,
        generatedAt: new Date(),
        summary: {
          totalUsers: users.length,
          totalTransactions: transactions.length,
          completedTransactions:
            completedTransactions.length,
          pendingTransactions:
            transactions.filter(
              (transaction) =>
                transaction.status === 'pending',
            ).length,
          failedTransactions:
            transactions.filter(
              (transaction) =>
                transaction.status === 'failed',
            ).length,
          totalRevenue,
          averageTransactionValue,
        },
        transactions,
        users,
      },
    })
  } catch (error) {
    console.error('Generate report error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
    })
  }
}