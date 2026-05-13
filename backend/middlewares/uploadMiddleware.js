import fs from 'fs'
import multer from 'multer'

const uploadDir = process.env.UPLOAD_DIR || 'uploads'

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true)
    return
  }
  cb(new Error('Only image and video files are allowed'))
}

export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 60) * 1024 * 1024,
  },
})
