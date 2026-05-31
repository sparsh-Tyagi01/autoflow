import mongoose from 'mongoose'

const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    systemPrompt: {
      type: String,
      default: 'You are a helpful AI assistant.',
    },

    model: {
      type: String,
      enum: ['gemini-2.5-flash-lite', 'gpt-4.1-mini', 'gpt-4.1', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'],
      default: 'gemini-2.5-flash-lite',
    },

    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },

    maxTokens: {
      type: Number,
      default: 4096,
    },

    tools: {
      type: [String],
      default: [],
    },

    memoryEnabled: {
      type: Boolean,
      default: true,
    },

    ragEnabled: {
      type: Boolean,
      default: false,
    },

    knowledgeBases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Upload',
      },
    ],

    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },

    avatar: {
      type: String,
      default: '',
    },

    color: {
      type: String,
      default: '#6366f1',
    },
  },
  {
    timestamps: true,
  }
)

agentSchema.index({ userId: 1 })

export const Agent = mongoose.model('Agent', agentSchema)
