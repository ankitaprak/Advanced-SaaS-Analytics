import type { Request, Response } from 'express'

import { Transaction } from '../models/Transaction.js'

import {
  createNotificationForUser,
} from '../services/notification.service.js'

import {
  createActivityLog,
} from '../services/activityLog.service.js'

const validStatuses = [
  'completed',
  'pending',
  'failed',
] as const

const validPaymentMethods = [
  'card',
  'upi',
  'bank_transfer',
  'other',
] as const

const transactionIdRegex =
  /^[A-Za-z0-9_-]+$/

const customerNameRegex =
  /^[A-Za-z]+(?: [A-Za-z]+)*$/

// ===============================
// GET ALL TRANSACTIONS
// ===============================

export const getTransactions = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      search,
      status,
      paymentMethod,
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

    // Search by transaction ID or customer
    if (search) {
      filter.$or = [
        {
          transactionId: {
            $regex: String(search),
            $options: 'i',
          },
        },
        {
          customer: {
            $regex: String(search),
            $options: 'i',
          },
        },
      ]
    }

    // Status filter
    if (status) {
      filter.status = status
    }

    // Payment method filter
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod
    }

    const skip =
      (pageNumber - 1) * limitNumber

    const [
      transactions,
      total,
    ] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNumber),

      Transaction.countDocuments(filter),
    ])

    const totalPages = Math.ceil(
      total / limitNumber,
    )

    res.status(200).json({
      success: true,
      message:
        'Transactions fetched successfully',
      data: transactions,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error(
      'Get transactions error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch transactions',
    })
  }
}

// ===============================
// GET TRANSACTION BY ID
// ===============================

export const getTransactionById = async (
  req: Request,
  res: Response,
) => {
  try {
    const transaction =
      await Transaction.findById(
        req.params.id,
      )

    if (!transaction) {
      res.status(404).json({
        success: false,
        message:
          'Transaction not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      message:
        'Transaction fetched successfully',
      data: transaction,
    })
  } catch (error) {
    console.error(
      'Get transaction error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to fetch transaction',
    })
  }
}

// ===============================
// CREATE TRANSACTION
// ===============================

export const createTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      transactionId,
      userId,
      customer,
      amount,
      status,
      paymentMethod,
      date,
    } = req.body

    // -------------------------------
    // Required fields
    // -------------------------------

    if (
      typeof transactionId !== 'string' ||
      typeof userId !== 'string' ||
      typeof customer !== 'string' ||
      amount === undefined ||
      amount === null ||
      amount === ''
    ) {
      res.status(400).json({
        success: false,
        message:
          'Transaction ID, user, customer and amount are required',
      })
      return
    }

    // -------------------------------
    // Transaction ID validation
    // -------------------------------

    if (
      transactionId !==
      transactionId.trim()
    ) {
      res.status(400).json({
        success: false,
        message:
          'Transaction ID cannot start or end with a space',
      })
      return
    }

    const trimmedTransactionId =
      transactionId.trim()

    if (
      trimmedTransactionId.length < 3
    ) {
      res.status(400).json({
        success: false,
        message:
          'Transaction ID must be at least 3 characters',
      })
      return
    }

    if (
      !transactionIdRegex.test(
        trimmedTransactionId,
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          'Transaction ID can contain only letters, numbers, hyphens and underscores',
      })
      return
    }

    // -------------------------------
    // User validation
    // -------------------------------

    const trimmedUserId =
      userId.trim()

    if (!trimmedUserId) {
      res.status(400).json({
        success: false,
        message:
          'Please select a valid user',
      })
      return
    }

    // -------------------------------
    // Customer validation
    // -------------------------------

    if (
      customer !== customer.trim()
    ) {
      res.status(400).json({
        success: false,
        message:
          'Customer name cannot start or end with a space',
      })
      return
    }

    const trimmedCustomer =
      customer.trim()

    if (
      trimmedCustomer.length < 2
    ) {
      res.status(400).json({
        success: false,
        message:
          'Customer name must be at least 2 characters',
      })
      return
    }

    if (
      !customerNameRegex.test(
        trimmedCustomer,
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          'Customer name can contain only letters and single spaces between words',
      })
      return
    }

    // -------------------------------
    // Amount validation
    // -------------------------------

    const numericAmount =
      Number(amount)

    if (
      !Number.isFinite(
        numericAmount,
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          'Please enter a valid amount',
      })
      return
    }

    if (numericAmount <= 0) {
      res.status(400).json({
        success: false,
        message:
          'Amount must be greater than 0',
      })
      return
    }

    // -------------------------------
    // Status validation
    // -------------------------------

    const finalStatus =
      status || 'pending'

    if (
      !validStatuses.includes(
        finalStatus,
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          'Invalid transaction status',
      })
      return
    }

    // -------------------------------
    // Payment method validation
    // -------------------------------

    const finalPaymentMethod =
      paymentMethod || 'other'

    if (
      !validPaymentMethods.includes(
        finalPaymentMethod,
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          'Invalid payment method',
      })
      return
    }

    // -------------------------------
    // Date validation
    // -------------------------------

    let finalDate: Date | undefined

    if (date !== undefined) {
      if (
        typeof date !== 'string' ||
        !date.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            'Transaction date is required',
        })
        return
      }

      const parsedDate =
        new Date(date)

      if (
        Number.isNaN(
          parsedDate.getTime(),
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            'Invalid transaction date',
        })
        return
      }

      finalDate = parsedDate
    }

    // -------------------------------
    // Duplicate transaction ID
    // -------------------------------

    const existingTransaction =
      await Transaction.findOne({
        transactionId:
          trimmedTransactionId,
      })

    if (existingTransaction) {
      res.status(409).json({
        success: false,
        message:
          'Transaction ID already exists',
      })
      return
    }

    // -------------------------------
    // Create transaction
    // -------------------------------

    const transaction =
      await Transaction.create({
        transactionId:
          trimmedTransactionId,

        userId:
          trimmedUserId,

        customer:
          trimmedCustomer,

        amount:
          numericAmount,

        status:
          finalStatus,

        paymentMethod:
          finalPaymentMethod,

        date:
          finalDate,
      })

    // -------------------------------
    // Notification
    // -------------------------------

    try {
      await createNotificationForUser({
        userId:
          trimmedUserId,

        title:
          'New transaction created',

        message:
          `Transaction ${trimmedTransactionId} of $${numericAmount.toLocaleString()} has been created.`,

        type:
          'success',
      })
    } catch (notificationError) {
      console.error(
        'Transaction notification error:',
        notificationError,
      )
    }

    // -------------------------------
    // Activity log
    // -------------------------------

    try {
      await createActivityLog({
        userId:
          req.user!.userId,

        action:
          'create',

        module:
          'transaction',

        description:
          `Created transaction ${trimmedTransactionId} for ${trimmedCustomer}`,
      })
    } catch (activityError) {
      console.error(
        'Create transaction activity log error:',
        activityError,
      )
    }

    res.status(201).json({
      success: true,
      message:
        'Transaction created successfully',
      data:
        transaction,
    })
  } catch (error) {
    console.error(
      'Create transaction error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to create transaction',
    })
  }
}

// ===============================
// UPDATE TRANSACTION
// ===============================

export const updateTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      customer,
      amount,
      status,
      paymentMethod,
      date,
    } = req.body

    const transaction =
      await Transaction.findById(
        req.params.id,
      )

    if (!transaction) {
      res.status(404).json({
        success: false,
        message:
          'Transaction not found',
      })
      return
    }

    // -------------------------------
    // Customer validation
    // -------------------------------

    if (customer !== undefined) {
      if (
        typeof customer !== 'string'
      ) {
        res.status(400).json({
          success: false,
          message:
            'Customer name must be text',
        })
        return
      }

      if (
        customer !== customer.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            'Customer name cannot start or end with a space',
        })
        return
      }

      const trimmedCustomer =
        customer.trim()

      if (
        trimmedCustomer.length < 2
      ) {
        res.status(400).json({
          success: false,
          message:
            'Customer name must be at least 2 characters',
        })
        return
      }

      if (
        !customerNameRegex.test(
          trimmedCustomer,
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            'Customer name can contain only letters and single spaces between words',
        })
        return
      }

      transaction.customer =
        trimmedCustomer
    }

    // -------------------------------
    // Amount validation
    // -------------------------------

    if (amount !== undefined) {
      const numericAmount =
        Number(amount)

      if (
        !Number.isFinite(
          numericAmount,
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            'Please enter a valid amount',
        })
        return
      }

      if (numericAmount <= 0) {
        res.status(400).json({
          success: false,
          message:
            'Amount must be greater than 0',
        })
        return
      }

      transaction.amount =
        numericAmount
    }

    // -------------------------------
    // Status validation
    // -------------------------------

    if (status !== undefined) {
      if (
        !validStatuses.includes(
          status,
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            'Invalid transaction status',
        })
        return
      }

      transaction.status =
        status
    }

    // -------------------------------
    // Payment method validation
    // -------------------------------

    if (
      paymentMethod !== undefined
    ) {
      if (
        !validPaymentMethods.includes(
          paymentMethod,
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            'Invalid payment method',
        })
        return
      }

      transaction.paymentMethod =
        paymentMethod
    }

    // -------------------------------
    // Date validation
    // -------------------------------

    if (date !== undefined) {
      if (
        typeof date !== 'string' ||
        !date.trim()
      ) {
        res.status(400).json({
          success: false,
          message:
            'Transaction date is required',
        })
        return
      }

      const parsedDate =
        new Date(date)

      if (
        Number.isNaN(
          parsedDate.getTime(),
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            'Invalid transaction date',
        })
        return
      }

      // IMPORTANT:
      // Transaction model expects Date
      transaction.date =
        parsedDate
    }

    // -------------------------------
    // Save updated transaction
    // -------------------------------

    await transaction.save()

    // -------------------------------
    // Activity log
    // -------------------------------

    try {
      await createActivityLog({
        userId:
          req.user!.userId,

        action:
          'update',

        module:
          'transaction',

        description:
          `Updated transaction ${transaction.transactionId}`,
      })
    } catch (activityError) {
      console.error(
        'Update transaction activity log error:',
        activityError,
      )
    }

    res.status(200).json({
      success: true,
      message:
        'Transaction updated successfully',
      data:
        transaction,
    })
  } catch (error) {
    console.error(
      'Update transaction error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to update transaction',
    })
  }
}

// ===============================
// DELETE TRANSACTION
// ===============================

export const deleteTransaction = async (
  req: Request,
  res: Response,
) => {
  try {
    const transaction =
      await Transaction.findByIdAndDelete(
        req.params.id,
      )

    if (!transaction) {
      res.status(404).json({
        success: false,
        message:
          'Transaction not found',
      })
      return
    }

    // -------------------------------
    // Activity log
    // -------------------------------

    try {
      await createActivityLog({
        userId:
          req.user!.userId,

        action:
          'delete',

        module:
          'transaction',

        description:
          `Deleted transaction ${transaction.transactionId}`,
      })
    } catch (activityError) {
      console.error(
        'Delete transaction activity log error:',
        activityError,
      )
    }

    res.status(200).json({
      success: true,
      message:
        'Transaction deleted successfully',
    })
  } catch (error) {
    console.error(
      'Delete transaction error:',
      error,
    )

    res.status(500).json({
      success: false,
      message:
        'Failed to delete transaction',
    })
  }
}
