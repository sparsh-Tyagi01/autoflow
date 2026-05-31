import { Request, Response } from 'express'

import axios from 'axios'

import { Message } from '../models/message.model'

import { Conversation } from '../models/conversation.model'

export async function chat(
  req: Request,
  res: Response
) {
  try {
    const {
      message,
      conversationId,
      agentConfig,
    } = req.body

    await Message.create({
      conversationId: conversationId,
      role: 'user',
      content: message,
    })

    const { invalidateCache } = require('../database/redis')
    await invalidateCache(`messages:${conversationId}`).catch(() => {})

    const response = await axios({
      method: 'post',
      url: `${process.env.AI_SERVICE_URL}/agents/stream`,
      data: {
        message,
        conversation_id: conversationId,
        ...(agentConfig
          ? {
              agent_config: {
                name: agentConfig.name,
                system_prompt: agentConfig.systemPrompt,
                model: agentConfig.model,
                temperature: agentConfig.temperature,
                tools: agentConfig.tools,
              },
            }
          : {}),
      },
      responseType: 'stream',
    })

    let assistantText = ''
    let buffer = ''
    let streamDone = false

    response.data.on(
      'data',
      (chunk: Buffer) => {
        try {
          buffer += chunk.toString()

          const parts = buffer.split('\n\n')
          buffer = parts.pop() || ''

          for (const part of parts) {
            if (streamDone) continue

            const line = part.trim()
            if (!line.startsWith('data:')) continue

            const token = line.replace(/^data:\s*/, '')
            if (token === '[DONE]') {
              streamDone = true
              continue
            }

            assistantText += token
            res.write(token)
          }
        } catch (err) {
          console.error('Error processing stream chunk:', err)
        }
      }
    )

    response.data.on(
      'end',
      async () => {
        try {
          if (assistantText.trim()) {
            await Message.create({
              conversationId: conversationId,
              role: 'assistant',
              content: assistantText,
            })

            const { invalidateCache } = require('../database/redis')
            await invalidateCache(`messages:${conversationId}`).catch(() => {})
          }

          await Conversation.findByIdAndUpdate(
            conversationId,
            {
              updatedAt: new Date(),
            }
          )
        } catch (error) {
          console.error('Failed to save message or update conversation in DB:', error)
        } finally {
          res.end()
        }
      }
    )
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Chat error',
    })
  }
}