import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const httpServer = createServer(app)

app.use(cors())

const io = new Server(httpServer, {
  cors: { origin: '*' }
})

// Serve built client in production
const clientDist = path.join(__dirname, '../client/dist')
app.use(express.static(clientDist))

// In-memory channel store
// channelId → { id, name, broadcasterSocketId, listenerCount }
const channels = new Map()

function buildChannelList() {
  return Array.from(channels.values()).map(({ id, name, listenerCount }) => ({
    id,
    name,
    listenerCount
  }))
}

function broadcastChannelList() {
  io.emit('channel:list', buildChannelList())
}

io.on('connection', (socket) => {
  // Send current channel list immediately on connect
  socket.emit('channel:list', buildChannelList())

  // --- Broadcaster events ---

  socket.on('channel:create', ({ channelId, name }) => {
    if (channels.has(channelId)) {
      socket.emit('channel:error', 'Channel ID already taken. Try again.')
      return
    }
    channels.set(channelId, {
      id: channelId,
      name,
      broadcasterSocketId: socket.id,
      listenerCount: 0
    })
    socket.join(channelId)
    socket.data.role = 'broadcaster'
    socket.data.channelId = channelId
    socket.emit('channel:created', { channelId })
    broadcastChannelList()
  })

  socket.on('channel:end', () => {
    const channelId = socket.data.channelId
    if (!channelId || socket.data.role !== 'broadcaster') return
    io.to(channelId).emit('channel:ended', { channelId })
    channels.delete(channelId)
    io.socketsLeave(channelId)
    socket.data.channelId = null
    socket.data.role = null
    broadcastChannelList()
  })

  socket.on('bulletin:send', ({ text }) => {
    const channelId = socket.data.channelId
    if (!channelId || socket.data.role !== 'broadcaster') return
    const bulletin = { text, timestamp: new Date().toISOString() }
    // Push to subscribers
    socket.to(channelId).emit('bulletin', bulletin)
    // Echo back to broadcaster for their history
    socket.emit('bulletin:sent', bulletin)
  })

  // --- Subscriber events ---

  socket.on('channel:join', ({ channelId }) => {
    const channel = channels.get(channelId)
    if (!channel) {
      socket.emit('channel:error', 'Channel not found or has ended.')
      return
    }
    // Leave previous channel if any
    if (socket.data.channelId) {
      socket.leave(socket.data.channelId)
      const prev = channels.get(socket.data.channelId)
      if (prev && prev.listenerCount > 0) {
        prev.listenerCount--
        io.to(prev.broadcasterSocketId).emit('listener:count', { count: prev.listenerCount })
      }
    }
    socket.join(channelId)
    socket.data.role = 'subscriber'
    socket.data.channelId = channelId
    channel.listenerCount++
    socket.emit('channel:joined', { channelId, name: channel.name })
    io.to(channel.broadcasterSocketId).emit('listener:count', { count: channel.listenerCount })
    broadcastChannelList()
  })

  socket.on('channel:leave', () => {
    const channelId = socket.data.channelId
    if (!channelId || socket.data.role !== 'subscriber') return
    socket.leave(channelId)
    const channel = channels.get(channelId)
    if (channel && channel.listenerCount > 0) {
      channel.listenerCount--
      io.to(channel.broadcasterSocketId).emit('listener:count', { count: channel.listenerCount })
      broadcastChannelList()
    }
    socket.data.channelId = null
    socket.data.role = null
  })

  // --- Disconnect cleanup ---

  socket.on('disconnect', () => {
    const channelId = socket.data.channelId
    if (!channelId) return

    if (socket.data.role === 'broadcaster') {
      io.to(channelId).emit('channel:ended', { channelId })
      channels.delete(channelId)
      io.socketsLeave(channelId)
      broadcastChannelList()
    } else if (socket.data.role === 'subscriber') {
      const channel = channels.get(channelId)
      if (channel && channel.listenerCount > 0) {
        channel.listenerCount--
        io.to(channel.broadcasterSocketId).emit('listener:count', { count: channel.listenerCount })
        broadcastChannelList()
      }
    }
  })
})

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, '0.0.0.0', () => {
  // Print all LAN addresses for convenience
  const nets = os.networkInterfaces()
  const lanIPs = []
  for (const iface of Object.values(nets)) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) lanIPs.push(addr.address)
    }
  }
  console.log(`\nBooletin server running on port ${PORT}`)
  console.log(`  Local:   http://localhost:${PORT}`)
  lanIPs.forEach(ip => console.log(`  LAN:     http://${ip}:${PORT}`))
  console.log('\nPoint your phone browser to the LAN address above.\n')
})
