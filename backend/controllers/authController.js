import generateToken from '../utils/generateToken.js'
import User from '../models/User.js'

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      res.status(400)
      throw new Error('Email, password, and role are required')
    }

    const user = await User.findOne({ email, role }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      res.status(401)
      throw new Error('Invalid credentials')
    }

    if (user.status !== 'Active') {
      res.status(403)
      throw new Error('Account is not active')
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const me = async (req, res) => {
  res.json({ success: true, user: req.user })
}

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'avatar']
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) req.user[key] = req.body[key]
    })

    if (req.body.password) req.user.password = req.body.password

    await req.user.save()
    res.json({ success: true, user: req.user })
  } catch (error) {
    next(error)
  }
}
