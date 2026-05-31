import express from 'express'

import {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} from '../controllers/workflow.controller'

import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.use(protect)

router.post('/', createWorkflow)

router.get('/', getWorkflows)

router.get('/:id', getWorkflowById)

router.put('/:id', updateWorkflow)

router.delete('/:id', deleteWorkflow)

export default router
