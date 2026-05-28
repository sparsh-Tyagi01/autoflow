import express from 'express'

import {
  createConversation,
  getConversations,
  getMessages,
} from '../controllers/conversation.controller'

import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.post(
  '/',
  protect,
  createConversation
)

router.get(
  '/',
  protect,
  getConversations
)

router.get(
  '/:conversationId/messages',
  protect,
  getMessages
)

export default router