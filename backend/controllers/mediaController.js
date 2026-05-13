import fs from 'fs'
import path from 'path'
import Media from '../models/Media.js'

const populateMedia = [
  { path: 'uploadedBy', select: 'name email role avatar permission' },
  { path: 'assignedTo', select: 'name email role avatar' },
  { path: 'reviewedBy', select: 'name email role avatar' },
  { path: 'category', select: 'name description active' },
]

const buildMediaQuery = (req) => {
  const { status, type, category, search, uploadedBy } = req.query
  const query = {}

  if (status) query.status = status
  if (type) query.type = type
  if (category) query.category = category
  if (uploadedBy) query.uploadedBy = uploadedBy
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  if (req.user.role === 'vendor') query.uploadedBy = req.user._id
  if (req.user.role === 'user') {
    query.$or = [
      ...(query.$or || []),
      { status: 'Approved' },
      { uploadedBy: req.user._id },
    ]
  }
  if (req.user.role === 'staff') {
    query.$or = [
      ...(query.$or || []),
      { assignedTo: req.user._id },
      { status: { $ne: 'Approved' } },
    ]
  }

  return query
}

const parseDeviceInfo = (value) => {
  if (!value) return undefined
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400)
      throw new Error('Media file is required')
    }

    const isVideo = req.file.mimetype.startsWith('video/')
    const status = req.user.role === 'admin' ? 'Approved' : 'Pending'
    const fileUrl = `/uploads/${req.file.filename}`

    const media = await Media.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      type: isVideo ? 'video' : 'image',
      status,
      fileUrl,
      thumbnailUrl: isVideo ? req.body.thumbnailUrl || '' : fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      deviceInfo: parseDeviceInfo(req.body.deviceInfo),
      uploadedBy: req.user._id,
      assignedTo: req.body.assignedTo || undefined,
    })

    const populated = await Media.findById(media._id).populate(populateMedia)
    res.status(201).json({ success: true, media: populated })
  } catch (error) {
    next(error)
  }
}

export const getMedia = async (req, res, next) => {
  try {
    const media = await Media.find(buildMediaQuery(req)).populate(populateMedia).sort({ createdAt: -1 })
    res.json({ success: true, count: media.length, media })
  } catch (error) {
    next(error)
  }
}

export const getMediaById = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id).populate(populateMedia)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }
    res.json({ success: true, media })
  } catch (error) {
    next(error)
  }
}

export const updateMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }

    const owner = media.uploadedBy.toString() === req.user._id.toString()
    const canEdit = req.user.role === 'admin' || (owner && media.status === 'Pending')

    if (!canEdit) {
      res.status(403)
      throw new Error('Only admins or owners of pending uploads can edit media')
    }

    ;['title', 'description', 'category', 'assignedTo', 'remarks'].forEach((key) => {
      if (req.body[key] !== undefined) media[key] = req.body[key]
    })

    await media.save()
    const populated = await Media.findById(media._id).populate(populateMedia)
    res.json({ success: true, media: populated })
  } catch (error) {
    next(error)
  }
}

export const reviewMedia = async (req, res, next) => {
  try {
    const { status, remarks } = req.body
    if (!['Approved', 'Rejected'].includes(status)) {
      res.status(400)
      throw new Error('Status must be Approved or Rejected')
    }

    const media = await Media.findById(req.params.id)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }

    media.status = status
    media.remarks = remarks || ''
    media.reviewedBy = req.user._id
    media.reviewedAt = new Date()
    await media.save()

    const populated = await Media.findById(media._id).populate(populateMedia)
    res.json({ success: true, media: populated })
  } catch (error) {
    next(error)
  }
}

export const deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }

    const owner = media.uploadedBy.toString() === req.user._id.toString()
    const canDelete = req.user.role === 'admin' || (owner && media.status === 'Pending')

    if (!canDelete) {
      res.status(403)
      throw new Error('Only admins or owners of pending uploads can delete media')
    }

    const filePath = path.join(process.cwd(), media.fileUrl.replace(/^\//, ''))
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await media.deleteOne()
    res.json({ success: true, message: 'Media deleted' })
  } catch (error) {
    next(error)
  }
}

export const toggleFavorite = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }

    const userId = req.user._id.toString()
    const exists = media.favorites.some((id) => id.toString() === userId)
    media.favorites = exists ? media.favorites.filter((id) => id.toString() !== userId) : [...media.favorites, req.user._id]
    await media.save()

    res.json({ success: true, favorite: !exists, media })
  } catch (error) {
    next(error)
  }
}

export const downloadMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      res.status(404)
      throw new Error('Media not found')
    }

    if (media.status !== 'Approved' && req.user.role !== 'admin') {
      res.status(403)
      throw new Error('Only approved media can be downloaded')
    }

    const filePath = path.join(process.cwd(), media.fileUrl.replace(/^\//, ''))
    res.download(filePath, media.originalName || path.basename(filePath))
  } catch (error) {
    next(error)
  }
}
