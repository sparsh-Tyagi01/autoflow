import express from 'express'

import {
  register,
  login,
  logout,
  getMe,
} from '../controllers/auth.controller'

import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.post('/register', register)

router.post('/login', login)

router.post('/logout', logout)

router.get('/me', protect, getMe)

export default router