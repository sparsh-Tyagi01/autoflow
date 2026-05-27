import dotenv from 'dotenv'

dotenv.config()

import http from 'http'

import app from './app'

import { connectDB } from './database/connect-db'

import { initSocket } from './socket/socket'

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()

  const server = http.createServer(app)

  initSocket(server)

  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    )
  })
}

startServer()