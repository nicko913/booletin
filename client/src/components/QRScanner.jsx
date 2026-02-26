import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    // Guard against StrictMode double-invoke
    if (startedRef.current) return
    startedRef.current = true

    const scanner = new Html5Qrcode('booletin-qr-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          scanner.stop().catch(() => {}).finally(() => onScan(decodedText))
        },
        () => {} // ignore per-frame errors
      )
      .catch((err) => {
        console.warn('QR scanner failed to start:', err)
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  function handleCancel() {
    scannerRef.current?.stop().catch(() => {}).finally(onClose)
  }

  return (
    <div className="fixed inset-0 bg-[#111111] z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
        <h2 className="text-white font-mono text-base">Scan QR Code</h2>
        <button
          onClick={handleCancel}
          className="text-muted font-mono text-sm px-3 py-1 rounded-lg bg-white/10 active:scale-95 transition-transform"
        >
          CANCEL
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted font-mono text-xs">Point at a Booletin QR code</p>
        {/* html5-qrcode mounts the video into this div */}
        <div id="booletin-qr-reader" className="w-full max-w-xs rounded-xl overflow-hidden" />
      </div>
    </div>
  )
}
