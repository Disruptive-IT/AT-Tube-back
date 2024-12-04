/* eslint-disable camelcase */
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
    const { id_users } = req.body
    const fileExt = path.extname(file.originalname).toLowerCase()
    cb(null, `DESIGN_${id_users}${fileExt}`)
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
