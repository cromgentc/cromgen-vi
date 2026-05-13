import express from 'express'
import {
  deleteMedia,
  downloadMedia,
  getMedia,
  getMediaById,
  reviewMedia,
  toggleFavorite,
  updateMedia,
  uploadMedia as uploadMediaController,
} from '../controllers/mediaController.js'
import { canApprove, canDownload, protect } from '../middlewares/authMiddleware.js'
import { uploadMedia } from '../middlewares/uploadMiddleware.js'

const router = express.Router()

router.use(protect)

router.route('/')
  .get(getMedia)
  .post(uploadMedia.single('file'), uploadMediaController)

router.get('/:id', getMediaById)
router.put('/:id', updateMedia)
router.delete('/:id', deleteMedia)
router.patch('/:id/review', canApprove, reviewMedia)
router.patch('/:id/favorite', toggleFavorite)
router.get('/:id/download', canDownload, downloadMedia)

export default router
