import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { rateLimit } from './middleware/rate-limit.middleware'

import authRoutes from './routes/auth.routes'
import chatRoutes from './routes/chat.routes'
import conversationRoutes from './routes/conversation.routes'
import agentRoutes from './routes/agent.routes'
import knowledgeRoutes from './routes/knowledge.routes'
import workflowRoutes from './routes/workflow.routes'
import analyticsRoutes from './routes/analytics.routes'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())

app.use(cookieParser())

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 60 * 1000, max: 20 }))
app.use('/api', rateLimit({ windowMs: 60 * 1000, max: 60 }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/agents', agentRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'AutoFlow API Gateway Running',
    version: '1.0.0',
  })
})

export default app