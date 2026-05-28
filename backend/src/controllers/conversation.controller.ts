import { Response } from 'express'

import { Conversation } from '../models/conversation.model'

import { Message } from '../models/message.model'

import { AuthRequest } from '../middleware/auth.middleware'

export async function createConversation(
  req: AuthRequest,
  res: Response
) {
  try {
    const conversation =
      await Conversation.create({
        user: req.userId,
      })

    return res.status(201).json(
      conversation
    )
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Server error',
    })
  }
}

export async function getConversations(
  req: AuthRequest,
  res: Response
) {
  try {
    const conversations =
      await Conversation.find({
        user: req.userId,
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

export async function getMessages(
  req: AuthRequest,
  res: Response
) {
  try {
    const messages = await Message.find({
      conversation:
        req.params.conversationId,
    }).sort({
      createdAt: 1,
    })

    return res.json(messages)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Server error',
    })
  }
}