import dotenv from 'dotenv'

dotenv.config()

import http from 'http'

import app from './app'

import { connectDB } from './database/connect-db'

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()

  const server = http.createServer(app)

  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    )
  })
}

startServer()