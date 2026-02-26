import { io } from 'socket.io-client'

// In dev: Vite proxies /socket.io → localhost:3001 (same origin works)
// In production: Node server serves everything, so same origin works too
// Override with VITE_SERVER_URL env var if needed (e.g. different LAN IP)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

export const socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling']
})
