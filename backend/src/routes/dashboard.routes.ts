import { Router } from 'express'

import { getDashboardSummary, getRevenueChart, getTrafficChart, getUserGrowthChart, } from '../controllers/dashboard.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.get(
  '/summary',
  protect,
  getDashboardSummary,
)

router.get(
  '/revenue',
  protect,
  getRevenueChart,
)

router.get(
  '/user-growth',
  protect,
  getUserGrowthChart,
)

router.get(
  '/traffic',
  protect,
  getTrafficChart,
)

export default router