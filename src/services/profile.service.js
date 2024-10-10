import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const UpdatePassword = async (userId, newPassword) => {
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
