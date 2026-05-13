import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Circle, FileUp, ImagePlus, RotateCcw, Save, Square, SwitchCamera, Video } from 'lucide-react'
import { addMedia } from '../utils/auth'

export default function UploadBox({ user, categories, onUploaded }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [stream, setStream] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')
  const [recording, setRecording] = useState(false)
  const [form, setForm] = useState({ title: '', category: categories[0]?.name || '', description: '' })
  const [error, setError] = useState('')
  const [fileDetails, setFileDetails] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  const fetchFileDetails = (pickedFile, source, dimensions = {}) => {
    const detail = {
      source,
      name: pickedFile.name,
      type: pickedFile.type || 'Unknown',
      size: `${(pickedFile.size / 1024 / 1024).toFixed(2)} MB`,
      capturedAt: new Date(pickedFile.lastModified || Date.now()).toLocaleString(),
      width: dimensions.width,
      height: dimensions.height,
    }

    if (pickedFile.type.startsWith('image/') && (!detail.width || !detail.height)) {
      const image = new window.Image()
      image.onload = () => {
        setFileDetails({ ...detail, width: image.naturalWidth, height: image.naturalHeight })
        URL.revokeObjectURL(image.src)
      }
      image.src = URL.createObjectURL(pickedFile)
      return
    }

    if (pickedFile.type.startsWith('video/') && (!detail.width || !detail.height)) {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        setFileDetails({ ...detail, width: video.videoWidth, height: video.videoHeight })
        URL.revokeObjectURL(video.src)
      }
      video.src = URL.createObjectURL(pickedFile)
      return
    }

    setFileDetails(detail)
  }

  const getDeviceInfo = async (source, dimensions = {}) => {
    let cameraLabel = 'Unavailable'
    const browserDevice = await getBrowserDeviceInfo()

    try {
      const devices = await navigator.mediaDevices?.enumerateDevices?.()
      cameraLabel = devices?.find((device) => device.kind === 'videoinput' && device.label)?.label || cameraLabel
    } catch {
      cameraLabel = 'Permission not available'
    }

    return {
      source,
      cameraLabel,
      mobileName: browserDevice.mobileName,
      modelNumber: browserDevice.modelNumber,
      platform: navigator.platform || 'Unknown',
      platformVersion: browserDevice.platformVersion,
      userAgent: navigator.userAgent || 'Unknown',
      language: navigator.language || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      screen: `${window.screen.width} x ${window.screen.height}`,
      viewport: `${window.innerWidth} x ${window.innerHeight}`,
      capturedAt: new Date().toISOString(),
      width: dimensions.width,
      height: dimensions.height,
      cameraFacing: facingMode === 'user' ? 'Front camera' : 'Back camera',
    }
  }

  const parseUserAgentDevice = () => {
    const ua = navigator.userAgent || ''
    const androidModel = ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build|\))/i)?.[1]?.trim()
    const iosModel = ua.match(/\b(iPhone|iPad|iPod)\b/i)?.[1]

    if (androidModel) {
      return {
        mobileName: androidModel,
        modelNumber: androidModel,
      }
    }

    if (iosModel) {
      return {
        mobileName: iosModel,
        modelNumber: iosModel,
      }
    }

    return {
      mobileName: 'Not available from browser',
      modelNumber: 'Not available from browser',
    }
  }

  const getBrowserDeviceInfo = async () => {
    const fallback = parseUserAgentDevice()

    try {
      const highEntropy = await navigator.userAgentData?.getHighEntropyValues?.(['model', 'platform', 'platformVersion', 'mobile'])
      const model = highEntropy?.model || ''
      const platform = highEntropy?.platform || ''

      return {
        mobileName: model || fallback.mobileName,
        modelNumber: model || fallback.modelNumber,
        platformVersion: highEntropy?.platformVersion || '',
        userAgentPlatform: platform,
        isMobile: Boolean(highEntropy?.mobile),
      }
    } catch {
      return {
        ...fallback,
        platformVersion: '',
        userAgentPlatform: '',
        isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || ''),
      }
    }
  }

  const readExifText = (view, tiffStart, entryOffset, littleEndian) => {
    const type = view.getUint16(entryOffset + 2, littleEndian)
    const count = view.getUint32(entryOffset + 4, littleEndian)
    const valueOffset = entryOffset + 8

    if (type !== 2 || count < 1) return ''

    const textOffset = count <= 4
      ? valueOffset
      : tiffStart + view.getUint32(valueOffset, littleEndian)

    const chars = []
    for (let index = 0; index < count - 1; index += 1) {
      const charCode = view.getUint8(textOffset + index)
      if (charCode) chars.push(String.fromCharCode(charCode))
    }
    return chars.join('').trim()
  }

  const readExifIfd = (view, tiffStart, ifdOffset, littleEndian) => {
    if (!ifdOffset) return {}

    const entries = view.getUint16(tiffStart + ifdOffset, littleEndian)
    const data = {}

    for (let index = 0; index < entries; index += 1) {
      const entryOffset = tiffStart + ifdOffset + 2 + index * 12
      const tag = view.getUint16(entryOffset, littleEndian)

      if (tag === 0x010f) data.make = readExifText(view, tiffStart, entryOffset, littleEndian)
      if (tag === 0x0110) data.model = readExifText(view, tiffStart, entryOffset, littleEndian)
      if (tag === 0x0132) data.exifDate = readExifText(view, tiffStart, entryOffset, littleEndian)
      if (tag === 0x8769) data.exifIfdOffset = view.getUint32(entryOffset + 8, littleEndian)
      if (tag === 0x9003) data.originalDateTime = readExifText(view, tiffStart, entryOffset, littleEndian)
      if (tag === 0xa002) data.pixelWidth = view.getUint32(entryOffset + 8, littleEndian)
      if (tag === 0xa003) data.pixelHeight = view.getUint32(entryOffset + 8, littleEndian)
    }

    return data
  }

  const readImageExif = async (pickedFile) => {
    if (!pickedFile.type.includes('jpeg') && !pickedFile.name.toLowerCase().match(/\.(jpg|jpeg)$/)) return null

    try {
      const buffer = await pickedFile.arrayBuffer()
      const view = new DataView(buffer)

      if (view.getUint16(0) !== 0xffd8) return null

      let offset = 2
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset)
        offset += 2
        const size = view.getUint16(offset)
        offset += 2

        if (marker === 0xffe1) {
          const exifHeader = [0, 1, 2, 3, 4, 5].map((index) => String.fromCharCode(view.getUint8(offset + index))).join('')
          if (exifHeader !== 'Exif\0\0') return null

          const tiffStart = offset + 6
          const littleEndian = view.getUint16(tiffStart) === 0x4949
          const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian)
          const mainIfd = readExifIfd(view, tiffStart, firstIfdOffset, littleEndian)
          const exifIfd = readExifIfd(view, tiffStart, mainIfd.exifIfdOffset, littleEndian)
          return { ...mainIfd, ...exifIfd }
        }

        offset += size - 2
      }
    } catch {
      return null
    }

    return null
  }

  const getDirectUploadDeviceInfo = async (pickedFile, dimensions = {}) => {
    const exif = await readImageExif(pickedFile)
    const cameraName = [exif?.make, exif?.model].filter(Boolean).join(' ').trim()
    const browserDevice = await getBrowserDeviceInfo()

    return {
      source: exif ? 'Direct upload EXIF' : 'Direct upload',
      cameraLabel: cameraName || 'Not found in image metadata',
      mobileName: cameraName || browserDevice.mobileName,
      modelNumber: exif?.model || browserDevice.modelNumber,
      make: exif?.make || '',
      model: exif?.model || '',
      originalDateTime: exif?.originalDateTime || exif?.exifDate || '',
      platform: navigator.platform || 'Unknown',
      platformVersion: browserDevice.platformVersion,
      userAgent: navigator.userAgent || 'Unknown',
      language: navigator.language || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      screen: `${window.screen.width} x ${window.screen.height}`,
      viewport: `${window.innerWidth} x ${window.innerHeight}`,
      capturedAt: new Date(pickedFile.lastModified || Date.now()).toISOString(),
      width: exif?.pixelWidth || dimensions.width,
      height: exif?.pixelHeight || dimensions.height,
      hasExif: Boolean(exif),
    }
  }

  const stopStreamOnly = (activeStream = stream) => {
    activeStream?.getTracks().forEach((track) => track.stop())
  }

  const stopCamera = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    stopStreamOnly()
    setStream(null)
    setCameraOn(false)
    setRecording(false)
  }

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  useEffect(() => () => {
    stream?.getTracks().forEach((track) => track.stop())
  }, [stream])

  const selectFile = async (incoming) => {
    const picked = incoming?.[0]
    if (!picked) return
    if (!picked.type.startsWith('image') && !picked.type.startsWith('video')) return setError('Only image and video files are supported.')
    if (picked.size > 60 * 1024 * 1024) return setError('File size must be under 60 MB for this demo.')
    stopCamera()
    setError('')
    setFile(picked)
    fetchFileDetails(picked, 'Direct upload')
    const deviceInfo = picked.type.startsWith('image/') ? await getDirectUploadDeviceInfo(picked) : null
    setForm((current) => ({ ...current, deviceInfo }))
    if (!form.title) setForm((current) => ({ ...current, title: picked.name.replace(/\.[^/.]+$/, '') }))
  }

  const startCamera = async (nextFacingMode = facingMode) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser. Please use direct upload.')
      return
    }

    try {
      setError('')
      stopStreamOnly()
      let mediaStream

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextFacingMode },
          audio: true,
        })
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextFacingMode },
          audio: false,
        })
      }

      setFacingMode(nextFacingMode)
      setFile(null)
      setStream(mediaStream)
      setCameraOn(true)
    } catch {
      setError('Camera access blocked or unavailable. Please allow camera permission or use direct upload.')
    }
  }

  const switchCamera = () => {
    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment'
    startCamera(nextFacingMode)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    const width = canvas.width
    const height = canvas.height

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Unable to capture photo. Please try again.')
        return
      }

      const capturedFile = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const deviceInfo = await getDeviceInfo('Mobile camera', { width, height })
      setFile(capturedFile)
      fetchFileDetails(capturedFile, 'Mobile camera', { width, height })
      setForm((current) => ({ ...current, title: current.title || 'Camera Capture', deviceInfo }))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const getRecordingMimeType = () => {
    const options = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
    return options.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || ''
  }

  const startRecording = () => {
    if (!stream || !window.MediaRecorder) {
      setError('Video recording is not supported in this browser.')
      return
    }

    try {
      recordedChunksRef.current = []
      const mimeType = getRecordingMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) recordedChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        const type = recorder.mimeType || 'video/webm'
        const extension = type.includes('mp4') ? 'mp4' : 'webm'
        const blob = new Blob(recordedChunksRef.current, { type })
        const recordedFile = new File([blob], `camera-recording-${Date.now()}.${extension}`, { type })
        const dimensions = {
          width: videoRef.current?.videoWidth || undefined,
          height: videoRef.current?.videoHeight || undefined,
        }
        const deviceInfo = await getDeviceInfo('Mobile camera video', dimensions)

        setFile(recordedFile)
        fetchFileDetails(recordedFile, 'Mobile camera video', dimensions)
        setForm((current) => ({ ...current, title: current.title || 'Camera Recording', deviceInfo }))
        setRecording(false)
        stopStreamOnly()
        setStream(null)
        setCameraOn(false)
      }

      recorder.start()
      setRecording(true)
      setError('')
    } catch {
      setError('Unable to start video recording. Please try direct upload.')
      setRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
  }

  const submit = (event) => {
    event.preventDefault()
    if (!file) return setError('Choose an image/video or capture a photo before saving.')
    if (!form.title || !form.category) return setError('Title and category are required.')
    addMedia({ ...form, file }, user)
    setFile(null)
    setFileDetails(null)
    setForm({ title: '', category: categories[0]?.name || '', description: '' })
    onUploaded?.('Upload saved. Non-admin uploads are marked pending until approved.')
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div
        className={`grid min-h-[360px] place-items-center rounded-3xl border border-dashed p-6 text-center transition ${dragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-300 bg-white/70 dark:border-white/10 dark:bg-white/5'}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files) }}
      >
        {cameraOn ? (
          <div className="w-full">
            <video ref={videoRef} autoPlay playsInline muted className="mx-auto max-h-[330px] w-full rounded-2xl bg-slate-950 object-contain" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="mt-4 inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold dark:bg-white/10">
              <button type="button" className={`rounded-xl px-4 py-2 ${facingMode === 'environment' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300' : 'text-slate-500'}`} onClick={() => startCamera('environment')} disabled={recording}>Back</button>
              <button type="button" className={`rounded-xl px-4 py-2 ${facingMode === 'user' ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-cyan-300' : 'text-slate-500'}`} onClick={() => startCamera('user')} disabled={recording}>Front</button>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-primary" onClick={capturePhoto} disabled={recording}><Camera size={17} /> Capture photo</button>
              <button type="button" className="btn-muted" onClick={switchCamera} disabled={recording}><SwitchCamera size={17} /> Switch camera</button>
              {recording
                ? <button type="button" className="btn-muted text-rose-600" onClick={stopRecording}><Square size={17} /> Stop recording</button>
                : <button type="button" className="btn-muted text-rose-600" onClick={startRecording}><Circle size={17} /> Record video</button>}
              <button type="button" className="btn-muted" onClick={stopCamera}><RotateCcw size={17} /> Cancel camera</button>
            </div>
            {recording && <p className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-300">Recording video...</p>}
          </div>
        ) : preview ? (
          <div className="w-full">
            {file.type.startsWith('video') ? <video src={preview} controls className="mx-auto max-h-[330px] rounded-2xl" /> : <img src={preview} alt="Preview" className="mx-auto max-h-[330px] rounded-2xl object-contain" />}
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{file.name} - {(file.size / 1024 / 1024).toFixed(1)} MB</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <label className="btn-muted cursor-pointer">
                <ImagePlus size={17} /> Change file
                <input type="file" className="hidden" accept="image/*,video/*" onChange={(event) => selectFile(event.target.files)} />
              </label>
              <button type="button" className="btn-muted" onClick={startCamera}><Camera size={17} /> Retake camera</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl"><FileUp size={34} /></div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">Camera capture or direct upload</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Take a live photo, or upload images and videos up to 60 MB.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-primary" onClick={startCamera}><Camera size={17} /> Open camera</button>
              <label className="btn-muted cursor-pointer">
                <ImagePlus size={17} /> Browse files
                <input type="file" className="hidden" accept="image/*,video/*" onChange={(event) => selectFile(event.target.files)} />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Media details</h2>
        <div className="mt-6 grid gap-4">
          <label className="field-label">Title<input className="field-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Campaign hero image" /></label>
          <label className="field-label">Category<select className="field-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
          {fileDetails && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-950 dark:text-white">Photo details</span>
                <span className="badge bg-blue-500/15 text-blue-700 dark:text-cyan-300">{fileDetails.source}</span>
              </div>
              <div className="mt-3 grid gap-2 text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                <p><span className="font-medium text-slate-700 dark:text-slate-200">File:</span> {fileDetails.name}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-200">Type:</span> {fileDetails.type}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-200">Size:</span> {fileDetails.size}</p>
                <p><span className="font-medium text-slate-700 dark:text-slate-200">Date:</span> {fileDetails.capturedAt}</p>
                {fileDetails.width && fileDetails.height && <p className="sm:col-span-2"><span className="font-medium text-slate-700 dark:text-slate-200">Dimensions:</span> {fileDetails.width} x {fileDetails.height}px</p>}
              </div>
              {form.deviceInfo && (
                <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
                    <Camera size={16} className="text-blue-600 dark:text-cyan-300" />
                    Mobile details
                  </div>
                  <div className="grid gap-2 text-slate-500 dark:text-slate-400 sm:grid-cols-2">
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Mobile name:</span> {form.deviceInfo.mobileName || 'Not available'}</p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Model number:</span> {form.deviceInfo.modelNumber || 'Not available'}</p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Camera:</span> {form.deviceInfo.cameraLabel}</p>
                    {form.deviceInfo.cameraFacing && <p><span className="font-medium text-slate-700 dark:text-slate-200">Camera side:</span> {form.deviceInfo.cameraFacing}</p>}
                    {form.deviceInfo.make && <p><span className="font-medium text-slate-700 dark:text-slate-200">Make:</span> {form.deviceInfo.make}</p>}
                    {form.deviceInfo.model && <p><span className="font-medium text-slate-700 dark:text-slate-200">Model:</span> {form.deviceInfo.model}</p>}
                    {form.deviceInfo.originalDateTime && <p><span className="font-medium text-slate-700 dark:text-slate-200">Photo taken:</span> {form.deviceInfo.originalDateTime}</p>}
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Platform:</span> {form.deviceInfo.platform}</p>
                    {form.deviceInfo.platformVersion && <p><span className="font-medium text-slate-700 dark:text-slate-200">OS version:</span> {form.deviceInfo.platformVersion}</p>}
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Screen:</span> {form.deviceInfo.screen}</p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Viewport:</span> {form.deviceInfo.viewport}</p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Language:</span> {form.deviceInfo.language}</p>
                    <p><span className="font-medium text-slate-700 dark:text-slate-200">Timezone:</span> {form.deviceInfo.timezone}</p>
                    <p className="sm:col-span-2 break-all"><span className="font-medium text-slate-700 dark:text-slate-200">Browser:</span> {form.deviceInfo.userAgent}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <label className="field-label">Description<textarea className="field-input min-h-28" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe usage, source, or review notes" /></label>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" type="submit"><Save size={17} /> Save media</button>
          <span className="btn-muted"><Video size={17} /> Status: {user.role === 'admin' ? 'Approved' : 'Pending'}</span>
        </div>
      </div>
    </form>
  )
}
