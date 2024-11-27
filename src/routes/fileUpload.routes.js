import express from 'express'
import multerConfig from '../config/multerConfig.js'
import { uploadAvatarController, uploadReferenceImageController } from '../controllers/uploadController.js'

const router = express.Router()

// Endpoint para subir avatares
router.post(
  '/upload/avatar/:user_id',
  multerConfig.uploadAvatars.single('file'),
  uploadAvatarController
)

// Endpoint para subir imágenes de referencia
router.post(
  '/upload/reference/:reference_id',
  multerConfig.uploadReferenceImages.single('file'),
  uploadReferenceImageController
)

export default router
