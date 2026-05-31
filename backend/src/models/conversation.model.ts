import mongoose from 'mongoose'

const conversationSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      title: {
        type: String,
        default: 'New Chat',
      },

      threadId: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  )

export const Conversation =
  mongoose.model(
    'Conversation',
    conversationSchema
  )