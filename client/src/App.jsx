import { useState, useEffect } from 'react'
import { socket } from './socket'
import Nav from './components/Nav'
import BroadcasterView from './components/BroadcasterView'
import SubscriberView from './components/SubscriberView'
import SettingsView from './components/SettingsView'

const DEFAULT_SETTINGS = { displayName: 'Anonymous' }

export default function App() {
  const [view, setView] = useState('subscriber')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [connected, setConnected] = useState(false)
  const [autoJoinId, setAutoJoinId] = useState(null)

  useEffect(() => {
    // Load persisted settings
    try {
      const saved = localStorage.getItem('booletin-settings')
      if (saved) setSettings(JSON.parse(saved))
    } catch {}

    // Check URL for deep-link auto-join: ?join=CHANNEL_ID
    const params = new URLSearchParams(window.location.search)
    const joinId = params.get('join')
    if (joinId) {
      setAutoJoinId(joinId)
      setView('subscriber')
    }

    socket.connect()
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.disconnect()
    }
  }, [])

  function saveSettings(updated) {
    setSettings(updated)
    localStorage.setItem('booletin-settings', JSON.stringify(updated))
  }

  return (
    // h-dvh handles mobile browser chrome correctly
    <div className="flex flex-col bg-[#111111] text-white" style={{ height: '100dvh', maxWidth: '480px', margin: '0 auto' }}>
      {/* Thin connecting banner */}
      {!connected && (
        <div className="shrink-0 bg-yellow-900/40 text-yellow-400 text-[11px] font-mono px-4 py-1 text-center tracking-wide">
          connecting…
        </div>
      )}

      {/* Scrollable main content */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {view === 'broadcaster' && (
          <BroadcasterView settings={settings} connected={connected} />
        )}
        {view === 'subscriber' && (
          <SubscriberView settings={settings} connected={connected} autoJoinId={autoJoinId} />
        )}
        {view === 'settings' && (
          <SettingsView settings={settings} onSave={saveSettings} />
        )}
      </main>

      <Nav view={view} onChange={setView} />
    </div>
  )
}
