import User from '../models/User.js'

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', phone, permission } = req.body

    if (!name || !email || !password) {
      res.status(400)
      throw new Error('Name, email, and password are required')
    }

    if (req.user.role === 'vendor' && role !== 'user') {
      res.status(403)
      throw new Error('Vendors can create user accounts only')
    }

    const exists = await User.findOne({ email })
    if (exists) {
      res.status(409)
      throw new Error('Email already exists')
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      permission: req.user.role === 'vendor'
        ? { canApprove: false, canDownload: true, canUpload: true }
        : permission,
      avatar: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      createdBy: req.user._id,
    })

    res.status(201).json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query
    const query = {}

    if (role) query.role = role
    if (status) query.status = status
    if (req.user.role === 'vendor') {
      query.role = 'user'
      query.createdBy = req.user._id
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const users = await User.find(query).sort({ createdAt: -1 })
    res.json({ success: true, count: users.length, users })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id }
    if (req.user.role === 'vendor') {
      query.role = 'user'
      query.createdBy = req.user._id
    }

    const user = await User.findOne(query)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const query = { _id: req.params.id }
    if (req.user.role === 'vendor') {
      query.role = 'user'
      query.createdBy = req.user._id
    }

    const user = await User.findOne(query)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    const allowed = req.user.role === 'vendor'
      ? ['name', 'email', 'phone', 'avatar']
      : ['name', 'email', 'role', 'status', 'permission', 'phone', 'avatar']
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) user[key] = req.body[key]
    })
    if (req.body.password) user.password = req.body.password

    await user.save()
    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const query = { _id: req.params.id }
    if (req.user.role === 'vendor') {
      query.role = 'user'
      query.createdBy = req.user._id
    }

    const user = await User.findOne(query)
    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }
    await user.deleteOne()
    res.json({ success: true, message: 'User deleted' })
  } catch (error) {
    next(error)
  }
}
