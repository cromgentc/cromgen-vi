import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
      res.status(401)
      throw new Error('Not authorized, token missing')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || user.status !== 'Active') {
      res.status(401)
      throw new Error('Not authorized, account unavailable')
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403)
    return next(new Error('Forbidden: insufficient role permission'))
  }
  next()
}

export const canApprove = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.permission?.canApprove) return next()
  res.status(403)
  next(new Error('Forbidden: approval permission required'))
}

export const canDownload = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.permission?.canDownload) return next()
  res.status(403)
  next(new Error('Forbidden: download permission required'))
}
