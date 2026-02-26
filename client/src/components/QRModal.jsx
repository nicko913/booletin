import { QRCodeSVG } from 'qrcode.react'

export default function QRModal({ url, channelName, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 flex flex-col items-center gap-4 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-white font-mono text-base font-medium">{channelName}</h2>
        <p className="text-muted font-mono text-xs text-center -mt-2">Scan to join this broadcast</p>

        <div className="bg-white p-3 rounded-xl">
          <QRCodeSVG value={url} size={200} />
        </div>

        <p className="text-[#444] font-mono text-[10px] text-center break-all leading-relaxed">{url}</p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 text-muted font-mono text-sm active:scale-95 transition-transform"
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
