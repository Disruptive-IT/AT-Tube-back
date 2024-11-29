import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const handleAvatarUpload = async (file, userId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }

  // Actualiza el campo 'avatar' en la base de datos
  await prisma.users.update({
    where: { id_users: userId },
    data: { avatar: file.path } // Guarda la ruta del archivo
  })

  return {
    message: 'Avatar subido y guardado exitosamente.',
    filePath: file.path,
    userId
  }
}

export const handleDesignImageUpload = async (file, referenceId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }

  // Actualiza el campo 'decorator' en la base de datos
  await prisma.templates.update({
    where: { id_template: referenceId },
    data: { decorator: file.path } // Guarda la ruta del archivo
  })

  return {
    message: 'Imagen de referencia subida y guardada exitosamente.',
    filePath: file.path,
    referenceId
  }
}
