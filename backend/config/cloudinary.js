import { v2 as cloudinary } from 'cloudinary'

export const isCloudinaryConfigured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

export const configureCloudinary = () => {
  if (!isCloudinaryConfigured()) return false

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  return true
}

export const uploadBufferToCloudinary = (file, options = {}) => new Promise((resolve, reject) => {
  if (!isCloudinaryConfigured()) {
    reject(new Error('Cloudinary is not configured'))
    return
  }

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: process.env.CLOUDINARY_FOLDER || 'cromgen-media',
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options,
    },
    (error, result) => {
      if (error) reject(error)
      else resolve(result)
    }
  )

  stream.end(file.buffer)
})

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId || !isCloudinaryConfigured()) return null
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
