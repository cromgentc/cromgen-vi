import express from 'express'
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../controllers/userController.js'
import { authorize, protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(authorize('admin', 'vendor'), getUsers)
  .post(authorize('admin', 'vendor'), createUser)

router.route('/:id')
  .get(authorize('admin', 'vendor'), getUserById)
  .put(authorize('admin', 'vendor'), updateUser)
  .delete(authorize('admin', 'vendor'), deleteUser)

export default router
