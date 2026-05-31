import express from 'express'

import {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} from '../controllers/agent.controller'

import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.use(protect)

router.post('/', createAgent)

router.get('/', getAgents)

router.get('/:id', getAgentById)

router.put('/:id', updateAgent)

router.delete('/:id', deleteAgent)

export default router
