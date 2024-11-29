import express from 'express'
import multerConfig from '../config/multerConfig.js'
import { uploadAvatarController, uploadDesignImageController } from '../controllers/uploadController.js'

const router = express.Router()

// Endpoint para subir avatares
router.post('/upload/avatar/:user_id', multerConfig.uploadAvatars.single('file'), uploadAvatarController)

// Endpoint para subir imágenes de referencia
router.post('/upload/design/:template_id', multerConfig.uploadDesignImages.single('file'), uploadDesignImageController)

export default router
