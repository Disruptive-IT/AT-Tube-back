import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

export const handleAvatarUpload = async (file, userId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }

  const fileUrl = `${process.env.URL_READFILES}/uploads/avatars/${file.filename}`
  // Actualiza el campo 'avatar' en la base de datos
  await prisma.users.update({
    where: { id_users: userId },
    data: { avatar: fileUrl } // Guarda la ruta del archivo
  })

  return {
    message: 'Avatar subido y guardado exitosamente.',
    fileUrl,
    userId
  }
}

export const handleDesignImageUpload = async (file, referenceId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }

  const fileUrl = `${process.env.URL_READFILES}/uploads/design_images/${file.filename}`
  // Actualiza el campo 'decorator' en la base de datos
  await prisma.templates.update({
    where: { id_template: referenceId },
    data: { decorator: fileUrl } // Guarda la ruta del archivo
  })

  return {
    message: 'Imagen de diseño subida y guardada exitosamente.',
    fileUrl,
    referenceId
  }
}
