import mongoose from 'mongoose'

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['trigger', 'ai', 'condition', 'action', 'delay', 'approval', 'api'],
      required: true,
    },
    label: { type: String, required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
  },
  { _id: false }
)

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String, default: '' },
  },
  { _id: false }
)

const workflowSchema = new mongoose.Schema(
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

    nodes: [nodeSchema],

    edges: [edgeSchema],

    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },

    trigger: {
      type: {
        type: String,
        enum: ['manual', 'schedule', 'webhook', 'event'],
        default: 'manual',
      },
      config: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    lastRunAt: { type: Date },

    runCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

workflowSchema.index({ userId: 1 })

export const Workflow = mongoose.model('Workflow', workflowSchema)
