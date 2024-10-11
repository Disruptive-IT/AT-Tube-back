import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// *Servicio de Actualizacion de Contraseña
export const UpdatePasswordService = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10) // ?hash de contrasena
  try {
    const users = await prisma.usuarios.update({
      where: { id_users: userId },
      data: { password: hashedPassword }
    })
    return users
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario:', error)
    throw error
  }
}

// *Servicio de actualizacion de Perfil de usuario SIN la contrasena
export const UpdateUserService = async (data) => {
  try {
    const user = await prisma.usuarios.update({
      where: { id_users: data.id },
      data: { 
        documentType: {connect: { id_document_type: data.documentType },},
        document: data.document,
        name: data.name,
        department: {connect: {id_department: data.department}},
        city: {connect: {id_city: data.city}} ,
        address: data.address,
        phone: data.phone,
      }
    })
    return user
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario:', error)
    throw error
  }
}


// *Servicio de Actualizacion de Contraseña
export const UpdateStateUserService = async (data) => {
  const newStatus = !data.status ? true: false // ?valido que estado trae el usuario para cambiarlo automaticamente
  try {
    const users = await prisma.usuarios.update({
      where: { id_users: data.id },
      data: { status: newStatus }
    })
    return users
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error)
    throw error
  }
}

