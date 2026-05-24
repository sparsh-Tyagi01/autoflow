import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.routes'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())

app.use(cookieParser())

app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({
    message: 'Backend running',
  })
})

export default app