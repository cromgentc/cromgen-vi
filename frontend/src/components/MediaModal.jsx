import { Download, Smartphone, X } from 'lucide-react'

export default function MediaModal({ media, onClose, canDownload, showDeviceInfo }) {
  if (!media) return null
  const deviceInfo = showDeviceInfo ? media.deviceInfo : null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-xl">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4 text-white">
          <div>
            <h3 className="font-semibold">{media.title}</h3>
            <p className="text-sm text-slate-400">{media.category} · {media.status}</p>
          </div>
          <div className="flex items-center gap-2">
            {canDownload && <a className="icon-btn-dark" href={media.src} download aria-label="Download"><Download size={18} /></a>}
            <button className="icon-btn-dark" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        </div>
        <div className="grid min-h-[55vh] place-items-center bg-black">
          {media.type === 'video'
            ? <video src={media.src} controls className="max-h-[75vh] w-full object-contain" />
            : <img src={media.src} alt={media.title} className="max-h-[75vh] w-full object-contain" />}
        </div>
        {deviceInfo && (
          <div className="border-t border-white/10 bg-slate-950 p-4 text-white">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Smartphone size={17} className="text-cyan-300" />
              Camera phone details sent with this image
            </div>
            <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
              <p><span className="text-slate-500">Source:</span> {deviceInfo.source}</p>
              <p><span className="text-slate-500">Mobile name:</span> {deviceInfo.mobileName || 'Not available'}</p>
              <p><span className="text-slate-500">Model number:</span> {deviceInfo.modelNumber || 'Not available'}</p>
              <p><span className="text-slate-500">Camera:</span> {deviceInfo.cameraLabel}</p>
              {deviceInfo.cameraFacing && <p><span className="text-slate-500">Camera side:</span> {deviceInfo.cameraFacing}</p>}
              {deviceInfo.make && <p><span className="text-slate-500">Make:</span> {deviceInfo.make}</p>}
              {deviceInfo.model && <p><span className="text-slate-500">Model:</span> {deviceInfo.model}</p>}
              {deviceInfo.originalDateTime && <p><span className="text-slate-500">Photo taken:</span> {deviceInfo.originalDateTime}</p>}
              <p><span className="text-slate-500">Platform:</span> {deviceInfo.platform}</p>
              {deviceInfo.platformVersion && <p><span className="text-slate-500">OS version:</span> {deviceInfo.platformVersion}</p>}
              <p><span className="text-slate-500">Screen:</span> {deviceInfo.screen}</p>
              <p><span className="text-slate-500">Viewport:</span> {deviceInfo.viewport}</p>
              <p><span className="text-slate-500">Language:</span> {deviceInfo.language}</p>
              <p><span className="text-slate-500">Timezone:</span> {deviceInfo.timezone}</p>
              <p><span className="text-slate-500">Captured:</span> {new Date(deviceInfo.capturedAt).toLocaleString()}</p>
              {deviceInfo.width && deviceInfo.height && <p><span className="text-slate-500">Image:</span> {deviceInfo.width} x {deviceInfo.height}px</p>}
              <p className="sm:col-span-2 lg:col-span-3"><span className="text-slate-500">User agent:</span> {deviceInfo.userAgent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
