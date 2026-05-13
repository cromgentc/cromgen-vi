import express from 'express'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../controllers/categoryController.js'
import { authorize, protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getCategories)
router.post('/', protect, authorize('admin'), createCategory)
router.put('/:id', protect, authorize('admin'), updateCategory)
router.delete('/:id', protect, authorize('admin'), deleteCategory)

export default router
