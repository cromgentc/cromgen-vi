import express from 'express'
import { login, me, updateProfile } from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', login)
router.get('/me', protect, me)
router.put('/profile', protect, updateProfile)

export default router
