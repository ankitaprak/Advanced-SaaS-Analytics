import { Router } from 'express'

import {
  getAnalyticsSummary,
  getConversionFunnel,
  getUserAnalytics,
} from '../controllers/analytics.controller.js'

import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/summary', protect, getAnalyticsSummary)

router.get('/users', protect, getUserAnalytics)

router.get('/funnel', protect, getConversionFunnel)

export default router