import express from 'express'

import { chat } from '../controllers/chat.controller'

const router = express.Router()

router.post('/', chat)

export default router