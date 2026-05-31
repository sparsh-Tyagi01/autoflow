import { Response } from 'express'

import { Analytics } from '../models/analytics.model'

import { AuthRequest } from '../middleware/auth.middleware'

import { Conversation } from '../models/conversation.model'

import { Agent } from '../models/agent.model'

export async function getDashboardStats(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.userId

    const [
      totalConversations,
      totalAgents,
      analyticsRecords,
    ] = await Promise.all([
      Conversation.countDocuments({ userId }),
      Agent.countDocuments({ userId }),
      Analytics.find({ userId })
        .sort({ createdAt: -1 })
        .limit(1000),
    ])

    const totalTokens = analyticsRecords.reduce(
      (sum, r) => sum + (r.tokensUsed?.total || 0),
      0
    )

    const totalCost = analyticsRecords.reduce(
      (sum, r) => sum + (r.cost || 0),
      0
    )

    const avgLatency =
      analyticsRecords.length > 0
        ? analyticsRecords.reduce((sum, r) => sum + (r.latencyMs || 0), 0) /
          analyticsRecords.length
        : 0

    // Token usage over last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyUsage = await Analytics.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          tokens: { $sum: '$tokensUsed.total' },
          requests: { $sum: 1 },
          cost: { $sum: '$cost' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Tool usage breakdown
    const toolUsage = await Analytics.aggregate([
      {
        $match: {
          userId,
          type: 'tool',
          toolName: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$toolName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    return res.json({
      totalConversations,
      totalAgents,
      totalTokens,
      totalCost: Math.round(totalCost * 100) / 100,
      avgLatency: Math.round(avgLatency),
      dailyUsage,
      toolUsage,
      recentActivity: analyticsRecords.slice(0, 20),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch analytics',
    })
  }
}

export async function getAnalyticsHistory(
  req: AuthRequest,
  res: Response
) {
  try {
    const { type, limit = '50', offset = '0' } = req.query

    const filter: any = { userId: req.userId }

    if (type) {
      filter.type = type
    }

    const records = await Analytics.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))

    const total = await Analytics.countDocuments(filter)

    return res.json({
      records,
      total,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch analytics history',
    })
  }
}
