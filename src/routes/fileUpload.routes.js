import { Router } from 'express'
import multerConfig from '../middlewares/multerConfig.js'
import { uploadAvatarController, uploadDesignImageController } from '../controllers/fileUpload.controller.js'

const router = Router()

// Endpoint para subir avatares
router.post('/avatar/:user_id', multerConfig.uploadAvatars.single('file'), uploadAvatarController)

// Endpoint para subir imágenes de referencia
router.post('/design/:template_id', multerConfig.uploadDesignImages.single('file'), uploadDesignImageController)

export default router
