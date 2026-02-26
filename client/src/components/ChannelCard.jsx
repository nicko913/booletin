export default function ChannelCard({ channel, onJoin }) {
  return (
    <button
      onClick={onJoin}
      className="w-full bg-surface rounded-xl px-4 py-4 flex items-center justify-between active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="pulse-dot w-2 h-2 rounded-full bg-accent shrink-0" />
        <div className="text-left">
          <p className="text-white font-mono text-sm font-medium">{channel.name}</p>
          <p className="text-muted font-mono text-xs mt-0.5">{channel.listenerCount} listening</p>
        </div>
      </div>
      <span className="text-accent font-mono text-xs border border-accent/30 px-3 py-1 rounded-md shrink-0">
        JOIN
      </span>
    </button>
  )
}
