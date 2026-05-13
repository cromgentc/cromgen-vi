import Category from '../models/Category.js'

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ success: true, category })
  } catch (error) {
    next(error)
  }
}

export const getCategories = async (req, res, next) => {
  try {
    const query = req.query.active ? { active: req.query.active === 'true' } : {}
    const categories = await Category.find(query).sort({ createdAt: -1 })
    res.json({ success: true, count: categories.length, categories })
  } catch (error) {
    next(error)
  }
}

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!category) {
      res.status(404)
      throw new Error('Category not found')
    }
    res.json({ success: true, category })
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      res.status(404)
      throw new Error('Category not found')
    }
    await category.deleteOne()
    res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    next(error)
  }
}
