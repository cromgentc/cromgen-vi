import { useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'

const imageFormats = [
  { label: 'Original', value: 'original' },
  { label: 'PNG', value: 'png', mime: 'image/png' },
  { label: 'JPG', value: 'jpg', mime: 'image/jpeg' },
  { label: 'WEBP', value: 'webp', mime: 'image/webp' },
]

const videoFormats = [
  { label: 'Original', value: 'original' },
  { label: 'MP4', value: 'mp4' },
  { label: 'WEBM', value: 'webm' },
  { label: 'MOV', value: 'mov' },
]

const safeName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'media'

const triggerDownload = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const downloadImageAs = (media, format) => {
  if (format.value === 'original') {
    triggerDownload(media.src, `${safeName(media.title)}-original`)
    return
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d').drawImage(image, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return triggerDownload(media.src, `${safeName(media.title)}-original`)
      const url = URL.createObjectURL(blob)
      triggerDownload(url, `${safeName(media.title)}.${format.value}`)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, format.mime, 0.92)
  }
  image.onerror = () => triggerDownload(media.src, `${safeName(media.title)}-original`)
  image.src = media.src
}

const downloadVideoAs = (media, format) => {
  const extension = format.value === 'original' ? 'original' : format.value
  triggerDownload(media.src, `${safeName(media.title)}.${extension}`)
}

export default function DownloadDropdown({ media, dark = false }) {
  const [open, setOpen] = useState(false)
  const formats = media.type === 'image' ? imageFormats : videoFormats

  const download = (format) => {
    setOpen(false)
    if (media.type === 'image') downloadImageAs(media, format)
    else downloadVideoAs(media, format)
  }

  const buttonClass = dark ? 'icon-btn-dark w-auto gap-2 px-3 text-sm' : 'btn-soft'

  return (
    <div className="relative">
      <button type="button" className={buttonClass} onClick={() => setOpen((value) => !value)} aria-label="Download formats">
        <Download size={15} /> Download <ChevronDown size={14} />
      </button>
      {open && (
        <div className={`absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-2xl border shadow-xl ${dark ? 'border-white/10 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-white'}`}>
          {formats.map((format) => (
            <button key={format.value} type="button" className="block w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => download(format)}>
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
