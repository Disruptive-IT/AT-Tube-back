/* eslint-disable camelcase */
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import path from 'path'

// Configuración para subir avatares
const storageAvatars = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => {
    const userId = req.params.user_id || 'unknown_user'
    const fileExt = path.extname(file.originalname).toLowerCase()
    cb(null, `AVATAR_${userId}${fileExt}`)
  }
})

// Configuración para subir imágenes de referencia
const storageDesignImages = multer.diskStorage({
  destination: 'uploads/design_images',
  filename: (req, file, cb) => {
    const uniqueId = uuidv4() // Genera un UUID único
    const fileExt = path.extname(file.originalname).toLowerCase()
    const filename = `DESIGN_${uniqueId}${fileExt}`

    req.uploadedImageName = filename // Guardamos el nombre en la solicitud
    cb(null, filename)
  }
})

// Middlewares para subida
const uploadAvatars = multer({
  storage: storageAvatars,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg']
    const fileExt = path.extname(file.originalname).toLowerCase()
    if (!allowedExtensions.includes(fileExt)) {
      return cb(new Error(`Extensión no permitida: ${fileExt}`))
    }
    cb(null, true)
  }
})

const uploadDesignImages = multer({
  storage: storageDesignImages,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg']
    const fileExt = path.extname(file.originalname).toLowerCase()
    if (!allowedExtensions.includes(fileExt)) {
      return cb(new Error(`Extensión no permitida: ${fileExt}`))
    }
    cb(null, true)
  }
})

export default { uploadAvatars, uploadDesignImages }
