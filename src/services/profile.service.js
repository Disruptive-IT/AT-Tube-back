import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// *Servicio de Actualizacion de Contraseña
export const UpdatePasswordService = async (userId, newPassword) => {
  try {
    if (!userId) {
      throw new Error('Debe proporcionar un ID de usuario.')
    }
    if (!newPassword) {
      throw new Error('Debe proporcionar una nueva contraseña.')
    }

    // Obtener el usuario actual para acceder a la contraseña
    const user = await prisma.users.findUnique({
      where: { id_users: userId },
      select: { password: true } // Solo seleccionamos el campo de la contraseña
    })

    if (!user) {
      throw new Error('ID proporcionado no existe.')
    }

    // Verificar si la nueva contraseña es igual a la actual
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      throw new Error('La nueva contraseña no puede ser igual a la contraseña actual.')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10) // Hash de la nueva contraseña
    const updatedUser = await prisma.users.update({
      where: { id_users: userId },
      data: { password: hashedPassword }
    })

    return updatedUser
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // !Este es el error cuando el registro no existe
      throw new Error('ID proporcionado no existe.')
    } else {
      console.error('Error al actualizar el usuario:', error)
      throw error
    }
  }
}

// *Servicio de actualizacion de Perfil de usuario SIN la contrasena
export const UpdateUserService = async (data) => {
  try {
    const {
      id,
      documentType,
      document,
      name,
      country,
      department,
      city,
      address,
      phone
    } = data

    const requiredFields = ['id', 'documentType', 'document', 'name', 'country', 'department', 'city', 'address', 'phone'] // ?campos requeridos
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`El campo "${field}" es requerido para el registro del usuario.`)
      }
    })

    // * Validar que no haya otro usuario con el mismo documento y tipo de documento
    const existingUser = await prisma.users.findFirst({
      where: {
        documentType: {
          id_document_type: documentType // Relación con la tabla de tipo de documento
        },
        document,
        NOT: {
          id_users: id // Excluye el usuario actual que está siendo actualizado
        }
      }
    })

    if (existingUser) {
      throw new Error('El documento y tipo de documento ya están en uso por otro usuario.')
    }

    // Si no hay conflictos, proceder con la actualización
    const user = await prisma.users.update({
      where: { id_users: id },
      data: {
        documentType: { connect: { id_document_type: documentType } },
        document,
        name,
        country: { connect: { id_country: country } },
        department: { connect: { id_department: department } },
        city: { connect: { id_city: city } },
        address,
        phone
      }
    })

    return user
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // !Este es el error cuando el registro no existe
      throw new Error('ID proporcionado no existe.')
    } else {
      console.error('Error al actualizar el usuario:', error)
      throw error
    }
  }
}

// *Servicio de Actualizacion de Contraseña
export const UpdateStateUserService = async (data) => {
  try {
    const { id, status } = data
    const requiredFields = ['id'] // ?campos requeridos
    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`El campo "${field}" es requerido para el registro del usuario.`)
      }
    })
    const users = await prisma.users.update({
      where: { id_users: data.id },
      data: { status: { set: data.status } }
    })
    return users
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') { // !Este es el error cuando el registro no existe
      throw new Error('ID proporcionado no existe.')
    } else {
      console.error('Error al actualizar el usuario:', error)
      throw error
    }
  }
}
