import mongoose from 'mongoose'

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['chat', 'agent', 'workflow', 'rag', 'tool'],
      required: true,
    },

    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },

    model: {
      type: String,
    },

    tokensUsed: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    latencyMs: {
      type: Number,
      default: 0,
    },

    cost: {
      type: Number,
      default: 0,
    },

    toolName: {
      type: String,
    },

    success: {
      type: Boolean,
      default: true,
    },

    errorMessage: {
      type: String,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

analyticsSchema.index({ userId: 1, createdAt: -1 })
analyticsSchema.index({ type: 1 })

export const Analytics = mongoose.model('Analytics', analyticsSchema)
