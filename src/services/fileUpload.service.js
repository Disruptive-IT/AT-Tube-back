/* eslint-disable camelcase */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

export const createTemplateWithImageService = async (templateData) => {
  const { id_users, design, decorator } = templateData

  // Validación de campos
  if (!id_users || !design) {
    throw new Error("Los campos 'id_users' y 'design' son obligatorios.")
  }

  // Crear el template sin la ruta de la imagen en este paso
  const newTemplate = await prisma.templates.create({
    data: {
      id_users,
      design: JSON.parse(design), // Asegura que `design` es JSON válido
      decorator // Si no hay imagen, será `null`
    }
  })

  return newTemplate
}

export const updateUrlImageService = async (templateId, uploadedImageName) => {
  const oldPath = path.join('uploads/design_images', uploadedImageName)
  const fileExtension = path.extname(uploadedImageName)

  // Crear el nuevo nombre del archivo con el templateId
  const newImageName = `DESIGN_${templateId}${fileExtension}`
  const newPath = path.join('uploads/design_images', newImageName)

  // Renombrar el archivo
  fs.renameSync(oldPath, newPath) // Renombrar el archivo en el sistema de archivos

  // Ruta completa a almacenar en la base de datos
  const imagePath = `uploads/design_images/${newImageName}`

  // Actualizar el template con la nueva ruta de la imagen
  const updatedTemplate = await prisma.templates.update({
    where: { id_template: templateId },
    data: {
      design: JSON.stringify({ imageUrl: imagePath }) // Actualiza la ruta en la base de datos
    }
  })

  return updatedTemplate
}

export const updateTemplateImageService = async (templateId, file) => {
  if (!templateId) {
    throw new Error("El campo 'templateId' es obligatorio.")
  }
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }

  const fileUrl = `${process.env.URL_READFILES}/uploads/design_images/${file.filename}`

  try {
    // Buscar el template existente
    const existingTemplate = await prisma.templates.findUnique({
      where: { id_template: templateId }
    })

    if (!existingTemplate) {
      throw new Error('Template no encontrado.')
    }

    // Eliminar la imagen anterior si existe
    if (existingTemplate.decorator) {
      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'design_images', path.basename(existingTemplate.decorator))

      // Verifica si el archivo existe antes de intentar eliminarlo
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath) // Elimina el archivo antiguo
      }
    }

    // Actualiza el campo 'decorator' con la nueva URL
    const updatedTemplate = await prisma.templates.update({
      where: { id_template: templateId },
      data: { decorator: fileUrl }
    })

    return {
      message: 'Imagen del template actualizada y reemplazada exitosamente.',
      updatedTemplate
    }
  } catch (error) {
    console.error('Error al actualizar la imagen del template:', error)
    throw error
  }
}

export const deleteTemplateImageService = async (templateId) => {
  // Buscar el template en la base de datos
  const template = await prisma.templates.findUnique({
    where: { id_template: templateId }
  })

  if (!template) {
    throw new Error('El template no existe.')
  }

  // Verificar si hay una imagen asociada en el campo 'decorator'
  const imagePath = template.decorator

  if (imagePath) {
    const absolutePath = path.resolve(__dirname, '..', '..', 'uploads', 'design_images', imagePath) // Ruta completa del archivo

    // Verificar si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath) // Eliminar el archivo físico
    }
  }

  // Actualizar el campo 'decorator' a `null` o una cadena vacía en la base de datos
  const updatedTemplate = await prisma.templates.update({
    where: { id_template: templateId },
    data: {
      decorator: null
    }
  })

  return updatedTemplate
}
