import { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'
import BulletinItem from './BulletinItem'
import QRModal from './QRModal'

function makeChannelId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function BroadcasterView({ settings, connected }) {
  const [channelName, setChannelName] = useState('')
  const [channelId]   = useState(makeChannelId)   // stable per mount
  const [isLive, setIsLive] = useState(false)
  const [listenerCount, setListenerCount] = useState(0)
  const [bulletins, setBulletins] = useState([])
  const [draft, setDraft] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [error, setError] = useState(null)
  const feedRef = useRef(null)

  useEffect(() => {
    socket.on('channel:created', () => {
      setIsLive(true)
      setError(null)
    })
    socket.on('channel:error', (msg) => setError(msg))
    socket.on('listener:count', ({ count }) => setListenerCount(count))
    socket.on('bulletin:sent', (bulletin) => {
      setBulletins(prev => [...prev, bulletin])
    })

    return () => {
      socket.off('channel:created')
      socket.off('channel:error')
      socket.off('listener:count')
      socket.off('bulletin:sent')
    }
  }, [])

  // Auto-scroll history to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [bulletins])

  function startBroadcast() {
    if (!channelName.trim()) { setError('Channel name is required.'); return }
    setError(null)
    socket.emit('channel:create', { channelId, name: channelName.trim() })
  }

  function endBroadcast() {
    socket.emit('channel:end')
    setIsLive(false)
    setListenerCount(0)
    setBulletins([])
  }

  function sendBulletin() {
    if (!draft.trim() || !isLive) return
    socket.emit('bulletin:send', { text: draft.trim() })
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBulletin() }
  }

  const joinUrl = `${window.location.origin}?join=${channelId}`

  return (
    <div className="flex flex-col p-4 gap-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-mono font-medium">Broadcast</h1>
        {isLive && (
          <div className="flex items-center gap-2">
            <span className="pulse-dot w-2 h-2 rounded-full bg-accent" />
            <span className="text-accent font-mono text-sm font-medium">LIVE</span>
            <span className="text-muted font-mono text-xs">{listenerCount} listening</span>
          </div>
        )}
      </div>

      {/* Channel setup card */}
      <div className="bg-surface rounded-xl p-4 flex flex-col gap-3">
        <label className="text-[11px] font-mono text-muted uppercase tracking-widest">Channel Name</label>
        <input
          type="text"
          value={channelName}
          onChange={e => setChannelName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isLive && startBroadcast()}
          disabled={isLive}
          placeholder="e.g. STAGE_ONE"
          maxLength={40}
          className="bg-transparent text-white font-mono text-base border-b border-white/20 pb-1 outline-none placeholder:text-[#444] disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          <span className="text-[#444] font-mono text-[11px]">ID: {channelId}</span>
          {isLive && (
            <button
              onClick={() => setShowQR(true)}
              className="text-[11px] font-mono text-accent border border-accent/30 px-2 py-1 rounded-md active:scale-95 transition-transform"
            >
              SHOW QR
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-900/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Live toggle */}
      {!isLive ? (
        <button
          onClick={startBroadcast}
          disabled={!connected}
          className="w-full py-4 rounded-xl bg-accent text-[#111111] font-mono font-semibold text-base tracking-wide disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          START BROADCAST
        </button>
      ) : (
        <button
          onClick={endBroadcast}
          className="w-full py-4 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 font-mono font-semibold text-base tracking-wide active:scale-[0.98] transition-transform"
        >
          END BROADCAST
        </button>
      )}

      {/* Bulletin composer */}
      {isLive && (
        <div className="bg-surface rounded-xl p-4 flex flex-col gap-3">
          <label className="text-[11px] font-mono text-muted uppercase tracking-widest">New Bulletin</label>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message… (Enter to send)"
            rows={3}
            className="bg-transparent text-white font-sans text-sm resize-none outline-none placeholder:text-[#444] leading-relaxed"
          />
          <button
            onClick={sendBulletin}
            disabled={!draft.trim()}
            className="self-end px-6 py-2 rounded-lg bg-accent text-[#111111] font-mono font-semibold text-sm disabled:opacity-30 active:scale-95 transition-all"
          >
            SEND
          </button>
        </div>
      )}

      {/* Sent history */}
      {bulletins.length > 0 && (
        <div className="flex flex-col gap-2 pb-4">
          <h2 className="text-[11px] font-mono text-muted uppercase tracking-widest">Sent</h2>
          <div ref={feedRef} className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-hide">
            {bulletins.map((b, i) => (
              <BulletinItem key={i} bulletin={b} />
            ))}
          </div>
        </div>
      )}

      {showQR && (
        <QRModal url={joinUrl} channelName={channelName} onClose={() => setShowQR(false)} />
      )}
    </div>
  )
}
