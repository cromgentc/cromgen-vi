import Category from '../models/Category.js'
import Media from '../models/Media.js'
import User from '../models/User.js'

export const getDashboardStats = async (req, res, next) => {
  try {
    const mediaQuery = {}
    if (req.user.role === 'vendor') mediaQuery.uploadedBy = req.user._id
    if (req.user.role === 'user') {
      mediaQuery.$or = [{ status: 'Approved' }, { uploadedBy: req.user._id }]
    }
    if (req.user.role === 'staff') {
      mediaQuery.$or = [{ assignedTo: req.user._id }, { status: { $ne: 'Approved' } }]
    }

    const [totalMedia, totalImages, totalVideos, pendingMedia, approvedMedia, rejectedMedia, totalCategories] = await Promise.all([
      Media.countDocuments(mediaQuery),
      Media.countDocuments({ ...mediaQuery, type: 'image' }),
      Media.countDocuments({ ...mediaQuery, type: 'video' }),
      Media.countDocuments({ ...mediaQuery, status: 'Pending' }),
      Media.countDocuments({ ...mediaQuery, status: 'Approved' }),
      Media.countDocuments({ ...mediaQuery, status: 'Rejected' }),
      Category.countDocuments({ active: true }),
    ])

    const users = req.user.role === 'admin'
      ? {
          totalVendors: await User.countDocuments({ role: 'vendor' }),
          totalStaff: await User.countDocuments({ role: 'staff' }),
          totalUsers: await User.countDocuments({ role: 'user' }),
        }
      : {}

    res.json({
      success: true,
      stats: {
        totalMedia,
        totalImages,
        totalVideos,
        pendingMedia,
        approvedMedia,
        rejectedMedia,
        totalCategories,
        ...users,
      },
    })
  } catch (error) {
    next(error)
  }
}
