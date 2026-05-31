import { Server } from 'socket.io'

import axios from 'axios'
import { Message } from '../models/message.model'
import { Conversation } from '../models/conversation.model'

let io: Server

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    // Join user-specific room
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`)
      console.log(`User ${userId} joined room`)
    })

    // Join conversation room
    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
    })

    // Leave conversation room
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // Socket-based real-time chat streaming handler
    socket.on('chat:message', async (data: {
      message: string
      conversationId: string
      agentConfig?: any
      userId: string
    }) => {
      const { message, conversationId, agentConfig, userId } = data
      console.log(`[Socket] Received chat message for conversation: ${conversationId}`)

      try {
        // Save user message to database
        await Message.create({
          conversationId,
          role: 'user',
          content: message,
        })

        const { invalidateCache } = require('../database/redis')
        await invalidateCache(`messages:${conversationId}`).catch(() => {})

        // Notify client rooms that streaming started
        socket.to(`conversation:${conversationId}`).emit('chat:start', { conversationId })
        socket.emit('chat:start', { conversationId })

        const response = await axios({
          method: 'post',
          url: `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/agents/stream`,
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

        response.data.on('data', (chunk: Buffer) => {
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

            // Emit token back to both the room and the sender
            socket.to(`conversation:${conversationId}`).emit('chat:token', {
              conversationId,
              token,
            })
            socket.emit('chat:token', {
              conversationId,
              token,
            })
          }
        })

        response.data.on('end', async () => {
          try {
            if (assistantText.trim()) {
              await Message.create({
                conversationId,
                role: 'assistant',
                content: assistantText,
              })

              const { invalidateCache } = require('../database/redis')
              await invalidateCache(`messages:${conversationId}`).catch(() => {})
            }

            await Conversation.findByIdAndUpdate(conversationId, {
              updatedAt: new Date(),
            })

            // Notify client rooms that streaming finished
            socket.to(`conversation:${conversationId}`).emit('chat:end', {
              conversationId,
              message: assistantText,
            })
            socket.emit('chat:end', {
              conversationId,
              message: assistantText,
            })
          } catch (error) {
            console.error('[Socket] Failed to save message on stream end:', error)
          }
        })

      } catch (err: any) {
        console.error('[Socket] Stream error:', err)
        socket.emit('chat:error', {
          conversationId,
          error: err.message || 'Stream error',
        })
      }
    })

    // Typing indicator
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        conversationId: data.conversationId,
      })
    })

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        conversationId: data.conversationId,
      })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }

  return io
}

// Emit streaming token to a specific conversation
export function emitStreamToken(conversationId: string, token: string) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('chat:token', {
      conversationId,
      token,
    })
  }
}

// Emit stream start event
export function emitStreamStart(conversationId: string) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('chat:start', {
      conversationId,
    })
  }
}

// Emit stream end event
export function emitStreamEnd(conversationId: string, fullMessage: string) {
  if (io) {
    io.to(`conversation:${conversationId}`).emit('chat:end', {
      conversationId,
      message: fullMessage,
    })
  }
}

// Emit notification to user
export function emitNotification(
  userId: string,
  notification: { title: string; message: string; type: string }
) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification)
  }
}