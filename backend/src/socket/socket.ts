import { Server } from 'socket.io'

let io: Server

export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(
      'Socket connected:',
      socket.id
    )

    socket.on('disconnect', () => {
      console.log(
        'Socket disconnected:',
        socket.id
      )
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error(
      'Socket.io not initialized'
    )
  }

  return io
}