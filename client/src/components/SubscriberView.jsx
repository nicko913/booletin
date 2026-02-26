import { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'
import BulletinItem from './BulletinItem'
import ChannelCard from './ChannelCard'
import QRScanner from './QRScanner'

export default function SubscriberView({ settings, connected, autoJoinId }) {
  const [channels, setChannels] = useState([])
  const [joinedChannel, setJoinedChannel] = useState(null)
  const [bulletins, setBulletins] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [broadcastEnded, setBroadcastEnded] = useState(false)
  const feedRef = useRef(null)

  useEffect(() => {
    socket.on('channel:list', (list) => setChannels(list))

    socket.on('channel:joined', ({ channelId, name }) => {
      setJoinedChannel({ id: channelId, name })
      setBulletins([])
      setBroadcastEnded(false)
    })

    socket.on('bulletin', (bulletin) => {
      setBulletins(prev => [...prev, bulletin])
    })

    socket.on('channel:ended', () => {
      setBroadcastEnded(true)
      setJoinedChannel(null)
    })

    socket.on('channel:error', (msg) => {
      console.warn('Channel error:', msg)
    })

    return () => {
      socket.off('channel:list')
      socket.off('channel:joined')
      socket.off('bulletin')
      socket.off('channel:ended')
      socket.off('channel:error')
    }
  }, [])

  // Auto-join from URL ?join=ID
  useEffect(() => {
    if (autoJoinId && connected) {
      socket.emit('channel:join', { channelId: autoJoinId })
    }
  }, [autoJoinId, connected])

  // Auto-scroll live feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [bulletins])

  function joinChannel(channelId) {
    socket.emit('channel:join', { channelId })
  }

  function leaveChannel() {
    socket.emit('channel:leave')
    setJoinedChannel(null)
    setBulletins([])
    setBroadcastEnded(false)
  }

  function handleQRScan(text) {
    setShowScanner(false)
    try {
      const url = new URL(text)
      const id = url.searchParams.get('join')
      if (id) { joinChannel(id); return }
    } catch {}
    // Treat raw text as a channel ID
    joinChannel(text.trim())
  }

  // --- Live feed view ---
  if (joinedChannel) {
    return (
      <div className="flex flex-col h-full p-4 gap-4 pt-6" style={{ minHeight: 'calc(100dvh - 56px - 48px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="pulse-dot w-2 h-2 rounded-full bg-accent" />
              <span className="text-accent font-mono text-xs font-medium">LIVE</span>
            </div>
            <h1 className="text-base font-mono font-medium text-white mt-0.5">{joinedChannel.name}</h1>
          </div>
          <button
            onClick={leaveChannel}
            className="px-4 py-2 rounded-lg bg-white/10 text-muted font-mono text-xs active:scale-95 transition-transform"
          >
            LEAVE
          </button>
        </div>

        {/* Feed */}
        <div ref={feedRef} className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide pb-2">
          {bulletins.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12">
              <span className="pulse-dot w-3 h-3 rounded-full bg-accent/40 inline-block" />
              <p className="text-muted font-mono text-sm">Waiting for bulletins…</p>
            </div>
          ) : (
            bulletins.map((b, i) => <BulletinItem key={i} bulletin={b} />)
          )}
        </div>
      </div>
    )
  }

  // --- Discovery view ---
  return (
    <div className="flex flex-col p-4 gap-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-mono font-medium text-white">Subscribe</h1>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface text-muted font-mono text-xs active:scale-95 transition-transform"
        >
          <CameraIcon />
          SCAN QR
        </button>
      </div>

      {/* Broadcast-ended notice */}
      {broadcastEnded && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-center">
          <p className="text-red-400 font-mono text-sm">Broadcast ended.</p>
        </div>
      )}

      {/* Channel list */}
      {!connected ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted font-mono text-sm">connecting…</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center">
            <span className="text-2xl">📡</span>
          </div>
          <p className="text-muted font-mono text-sm">No broadcasts nearby</p>
          <p className="text-[#444] font-mono text-xs">Scan a QR code to join directly</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h2 className="text-[11px] font-mono text-muted uppercase tracking-widest">Nearby Broadcasts</h2>
          {channels.map(ch => (
            <ChannelCard key={ch.id} channel={ch} onJoin={() => joinChannel(ch.id)} />
          ))}
        </div>
      )}

      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
