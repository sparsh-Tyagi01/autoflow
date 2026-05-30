import mongoose from 'mongoose'

const messageSchema =
  new mongoose.Schema(
    {
      role: String,

      content: String,
    },
    {
      _id: false,
    }
  )

const chatSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      conversationId: String,

      messages: [
        messageSchema,
      ],
    },
    {
      timestamps: true,
    }
  )

export const Chat =
  mongoose.model(
    'Chat',
    chatSchema
  )