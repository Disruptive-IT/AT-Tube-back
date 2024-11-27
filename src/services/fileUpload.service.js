// Servicio para manejar la lógica de subida de archivos
export const handleAvatarUpload = async (file, userId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }
  return {
    message: 'Avatar subido exitosamente.',
    filePath: file.path,
    userId
  }
}

export const handleReferenceImageUpload = async (file, referenceId) => {
  if (!file) {
    throw new Error('No se recibió ningún archivo.')
  }
  return {
    message: 'Imagen de referencia subida exitosamente.',
    filePath: file.path,
    referenceId
  }
}
