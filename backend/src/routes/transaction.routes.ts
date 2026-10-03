import { Router } from 'express'

import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transaction.controller.js'

import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = Router()

// View transactions
router.get(
  '/',
  protect,
  getTransactions,
)

// View single transaction
router.get(
  '/:id',
  protect,
  getTransactionById,
)

// Create transaction
router.post(
  '/',
  protect,
  authorize('Admin', 'Manager'),
  createTransaction,
)

// Update transaction
router.put(
  '/:id',
  protect,
  authorize('Admin', 'Manager'),
  updateTransaction,
)

// Delete transaction
router.delete(
  '/:id',
  protect,
  authorize('Admin'),
  deleteTransaction,
)

export default router