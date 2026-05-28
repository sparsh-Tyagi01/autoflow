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
    } = req.body

    await Message.create({
      conversation: conversationId,
      role: 'user',
      content: message,
    })

    const response = await axios({
      method: 'post',
      url: `${process.env.AI_SERVICE_URL}/chat`,
      data: {
        message,
      },
      responseType: 'stream',
    })

    let assistantText = ''

    response.data.on(
      'data',
      async (chunk: Buffer) => {
        const text = chunk.toString()

        assistantText += text

        res.write(text)
      }
    )

    response.data.on(
      'end',
      async () => {
        await Message.create({
          conversation: conversationId,
          role: 'assistant',
          content: assistantText,
        })

        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            updatedAt: new Date(),
          }
        )

        res.end()
      }
    )
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Chat error',
    })
  }
}