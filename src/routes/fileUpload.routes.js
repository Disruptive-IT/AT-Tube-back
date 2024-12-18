import { Router } from 'express'
import multerConfig from '../middlewares/multerConfig.js'
import { uploadAvatarController, createTemplateWithImageController, updateTemplateImageController, deleteTemplateImageController } from '../controllers/fileUpload.controller.js'

const router = Router()

// Endpoint para subir avatares
router.post('/avatar/:user_id', multerConfig.uploadAvatars.single('file'), uploadAvatarController)

// Endpoint para subir imágenes de referencia
router.post('/template/design', multerConfig.uploadDesignImages.single('file'), createTemplateWithImageController)

// Endpoint para actualizar un template con una imagen, o actualizar la imagen de un template
router.put('/template/design/update/:template_id', multerConfig.uploadDesignImages.single('file'), updateTemplateImageController)

// Endpoint para eliminar la imagen o diseño del template
router.delete('/template/delete/image/:template_id', deleteTemplateImageController)

export default router
