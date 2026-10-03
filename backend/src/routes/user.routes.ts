import { Router } from 'express'

import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js'

import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'

const router = Router()

// View users
router.get(
  '/',
  protect,
  getUsers,
)

// Create user
router.post(
  '/',
  protect,
  authorize('Admin', 'Manager'),
  createUser,
)

// View single user
router.get(
  '/:id',
  protect,
  getUserById,
)

// Update user
router.put(
  '/:id',
  protect,
  authorize('Admin', 'Manager'),
  updateUser,
)

// Delete user
router.delete(
  '/:id',
  protect,
  authorize('Admin'),
  deleteUser,
)

export default router