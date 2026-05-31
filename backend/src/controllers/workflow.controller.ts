import { Response } from 'express'

import { z } from 'zod/v4'

import { Workflow } from '../models/workflow.model'

import { AuthRequest } from '../middleware/auth.middleware'

const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  trigger: z
    .object({
      type: z.enum(['manual', 'schedule', 'webhook', 'event']).optional(),
      config: z.any().optional(),
    })
    .optional(),
})

export async function createWorkflow(
  req: AuthRequest,
  res: Response
) {
  try {
    const parsed = createWorkflowSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((i) => i.message),
      })
    }

    const workflow = await Workflow.create({
      ...parsed.data,
      userId: req.userId,
    })

    if (workflow.status === 'active') {
      const { syncWorkflowSchedule } = require('../services/queue.service')
      await syncWorkflowSchedule(workflow).catch((err: any) =>
        console.error('Failed to sync workflow schedule on create:', err)
      )
    }

    return res.status(201).json(workflow)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to create workflow',
    })
  }
}

export async function getWorkflows(
  req: AuthRequest,
  res: Response
) {
  try {
    const workflows = await Workflow.find({
      userId: req.userId,
    }).sort({ updatedAt: -1 })

    return res.json(workflows)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch workflows',
    })
  }
}

export async function getWorkflowById(
  req: AuthRequest,
  res: Response
) {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!workflow) {
      return res.status(404).json({
        message: 'Workflow not found',
      })
    }

    return res.json(workflow)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch workflow',
    })
  }
}

export async function updateWorkflow(
  req: AuthRequest,
  res: Response
) {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      req.body,
      { new: true }
    )

    if (!workflow) {
      return res.status(404).json({
        message: 'Workflow not found',
      })
    }

    // Sync workflow repeatable job
    const { syncWorkflowSchedule } = require('../services/queue.service')
    await syncWorkflowSchedule(workflow).catch((err: any) =>
      console.error('Failed to sync workflow schedule on update:', err)
    )

    return res.json(workflow)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to update workflow',
    })
  }
}

export async function deleteWorkflow(
  req: AuthRequest,
  res: Response
) {
  try {
    const workflow = await Workflow.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!workflow) {
      return res.status(404).json({
        message: 'Workflow not found',
      })
    }

    // Remove repeatable job
    const { removeWorkflowSchedule } = require('../services/queue.service')
    await removeWorkflowSchedule(req.params.id).catch((err: any) =>
      console.error('Failed to remove workflow schedule on delete:', err)
    )

    return res.json({
      message: 'Workflow deleted',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to delete workflow',
    })
  }
}
