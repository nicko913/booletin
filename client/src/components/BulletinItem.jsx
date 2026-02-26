export default function BulletinItem({ bulletin }) {
  const time = new Date(bulletin.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="bg-surface rounded-lg px-4 py-3 flex gap-3 items-start">
      <span className="text-muted font-mono text-xs pt-0.5 shrink-0">{time}</span>
      <p className="text-white font-sans text-sm leading-relaxed break-words min-w-0">{bulletin.text}</p>
    </div>
  )
}
