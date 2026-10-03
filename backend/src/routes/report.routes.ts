import { Router } from 'express'

import { generateReport, getReportSummary } from '../controllers/report.controller.js'

import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/summary', protect, getReportSummary)

router.get('/generate', protect, generateReport)

export default router