import express from 'express'

import {
  getDashboardStats,
  getAnalyticsHistory,
} from '../controllers/analytics.controller'

import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.use(protect)

router.get('/dashboard', getDashboardStats)

router.get('/history', getAnalyticsHistory)

export default router
