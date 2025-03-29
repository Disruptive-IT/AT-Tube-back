import fs from 'fs'
import path from 'path'
import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient

const prisma = new PrismaClient()


const deleteTemplateService = async (id_template) => {
    try {
      // Verificar si el template existe en la base de datos
      const validateTemplate = await prisma.templates.findUnique({
        where: {
          id_template
        }
      })
  
      if (!validateTemplate) {
        const error = new Error(`El template con ID ${id_template} no existe.`)
        error.name = 'NotFoundError'
        throw error
      }
  
      // Verificar si el campo decorator tiene una imagen asociada
      if (validateTemplate.decorator) {
        // Extraer el nombre del archivo de la URL
        const fileName = path.basename(validateTemplate.decorator) // Obtiene "DESIGN_d3b75c90-c699-4f37-9362-170947f410df.png"
        const filePath = path.join('uploads', 'design_images', fileName) // Construye la ruta completa
  
        // Eliminar el archivo del sistema de archivos
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath) // Elimina el archivo
          console.log(`Archivo eliminado: ${filePath}`)
        } else {
          console.warn(`El archivo no existe: ${filePath}`)
        }
      }
  
      // Eliminar el registro del template de la base de datos
      const response = await prisma.templates.delete({
        where: {
          id_template
        }
      })
  
      return response
    } catch (error) {
      console.error('Error al eliminar el template', error)
      const customError = new Error('Error al eliminar el template')
      customError.name = 'InternalError'
      throw customError
    }
  }

export default deleteTemplateService