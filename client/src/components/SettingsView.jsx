import { useState } from 'react'

export default function SettingsView({ settings, onSave }) {
  const [displayName, setDisplayName] = useState(settings.displayName)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ ...settings, displayName: displayName.trim() || 'Anonymous' })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex flex-col p-4 gap-5 pt-6">
      <h1 className="text-lg font-mono font-medium text-white">Settings</h1>

      {/* Display name */}
      <div className="bg-surface rounded-xl p-4 flex flex-col gap-3">
        <label className="text-[11px] font-mono text-muted uppercase tracking-widest">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="Anonymous"
          maxLength={32}
          className="bg-transparent text-white font-mono text-base border-b border-white/20 pb-1 outline-none placeholder:text-[#444]"
        />
        <button
          onClick={handleSave}
          className={`self-start mt-1 px-5 py-2 rounded-lg font-mono text-sm font-semibold active:scale-95 transition-all ${
            saved
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'bg-accent text-[#111111]'
          }`}
        >
          {saved ? 'SAVED ✓' : 'SAVE'}
        </button>
      </div>

      {/* About */}
      <div className="bg-surface rounded-xl p-4 flex flex-col gap-2">
        <h2 className="text-[11px] font-mono text-muted uppercase tracking-widest mb-1">About</h2>
        <p className="text-white font-mono text-sm font-medium">Booletin</p>
        <p className="text-muted font-mono text-xs">v1.0.0</p>
        <p className="text-muted font-mono text-xs leading-relaxed mt-1">
          Fully local real-time bulletins.{'\n'}
          No accounts. No storage. No cloud.
        </p>
      </div>
    </div>
  )
}
