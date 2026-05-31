import { Response } from 'express'

import { Conversation } from '../models/conversation.model'

import { Message } from '../models/message.model'

import { AuthRequest } from '../middleware/auth.middleware'

import crypto from 'crypto'

export async function createConversation(
  req: AuthRequest,
  res: Response
) {
  const conversation =
    await Conversation.create({
      userId: req.userId,

      threadId:
        crypto.randomUUID(),
    })

  return res.json(
    conversation
  )
}

export async function getConversations(
  req: AuthRequest,
  res: Response
) {
  try {
    const conversations =
      await Conversation.find({
        userId: req.userId,
      }).sort({
        updatedAt: -1,
      })

    return res.json(conversations)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Server error',
    })
  }
}

import { getCache, setCache } from '../database/redis'

export async function getMessages(
  req: AuthRequest,
  res: Response
) {
  const { conversationId } = req.params
  const cacheKey = `messages:${conversationId}`

  try {
    // 1. Try reading from Redis Cache
    const cachedMessages = await getCache(cacheKey)
    if (cachedMessages) {
      console.log(`[Cache Hit] Messages for conversation: ${conversationId}`)
      return res.json(JSON.parse(cachedMessages))
    }

    // 2. Fallback to MongoDB
    console.log(`[Cache Miss] Fetching messages from MongoDB for conversation: ${conversationId}`)
    const messages = await Message.find({
      conversationId,
    }).sort({
      createdAt: 1,
    })

    // 3. Cache results for 30 minutes (1800 seconds)
    await setCache(cacheKey, JSON.stringify(messages), 1800)

    return res.json(messages)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Server error',
    })
  }
}