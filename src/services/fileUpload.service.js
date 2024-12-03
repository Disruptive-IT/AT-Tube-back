import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

export const handleAvatarUpload = async (file, userId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }

  // Buscar al usuario en la base de datos para obtener el avatar actual
  const user = await prisma.users.findUnique({
    where: { id_users: userId },
    select: { avatar: true }
  })

  // Si el usuario tiene un avatar anterior, eliminar el archivo del sistema de archivos
  if (user && user.avatar) {
    const previousAvatarPath = path.join(
      'uploads/avatars',
      path.basename(user.avatar) // Extraer solo el nombre del archivo
    )

    // Verificar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(previousAvatarPath)) {
      fs.unlinkSync(previousAvatarPath) // Eliminar archivo anterior
    }
  }

  const fileUrl = `${process.env.URL_READFILES}/uploads/avatars/${file.filename}`

  // Actualizar la base de datos con el nuevo avatar
  await prisma.users.update({
    where: { id_users: userId },
    data: { avatar: fileUrl }
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
