import { Response } from 'express'

import { z } from 'zod/v4'

import { Agent } from '../models/agent.model'

import { AuthRequest } from '../middleware/auth.middleware'
import { getCache, setCache, invalidateCache } from '../database/redis'

const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  model: z.enum(['gemini-2.5-flash-lite', 'gpt-4.1-mini', 'gpt-4.1', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash']).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(128000).optional(),
  tools: z.array(z.string()).optional(),
  memoryEnabled: z.boolean().optional(),
  ragEnabled: z.boolean().optional(),
  color: z.string().optional(),
})

const updateAgentSchema = createAgentSchema.partial()

export async function createAgent(
  req: AuthRequest,
  res: Response
) {
  try {
    const parsed = createAgentSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((i) => i.message),
      })
    }

    const agent = await Agent.create({
      ...parsed.data,
      userId: req.userId,
    })

    // Invalidate list cache
    await invalidateCache(`user:${req.userId}:agents`)

    return res.status(201).json(agent)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to create agent',
    })
  }
}

export async function getAgents(
  req: AuthRequest,
  res: Response
) {
  try {
    const cacheKey = `user:${req.userId}:agents`
    const cached = await getCache(cacheKey)

    if (cached) {
      return res.json(JSON.parse(cached))
    }

    const agents = await Agent.find({
      userId: req.userId,
    }).sort({ updatedAt: -1 })

    await setCache(cacheKey, JSON.stringify(agents), 3600) // Cache for 1 hour

    return res.json(agents)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch agents',
    })
  }
}

export async function getAgentById(
  req: AuthRequest,
  res: Response
) {
  try {
    const cacheKey = `agent:${req.params.id}`
    const cached = await getCache(cacheKey)

    if (cached) {
      return res.json(JSON.parse(cached))
    }

    const agent = await Agent.findOne({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      })
    }

    await setCache(cacheKey, JSON.stringify(agent), 3600)

    return res.json(agent)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch agent',
    })
  }
}

export async function updateAgent(
  req: AuthRequest,
  res: Response
) {
  try {
    const parsed = updateAgentSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((i) => i.message),
      })
    }

    const agent = await Agent.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      parsed.data,
      { new: true }
    )

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      })
    }

    // Invalidate caches
    await invalidateCache(`user:${req.userId}:agents`)
    await invalidateCache(`agent:${req.params.id}`)

    return res.json(agent)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to update agent',
    })
  }
}

export async function deleteAgent(
  req: AuthRequest,
  res: Response
) {
  try {
    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      })
    }

    // Invalidate caches
    await invalidateCache(`user:${req.userId}:agents`)
    await invalidateCache(`agent:${req.params.id}`)

    return res.json({
      message: 'Agent deleted',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to delete agent',
    })
  }
}
