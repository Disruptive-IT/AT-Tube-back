import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getUserAccountService = async (userId) => {
  try {
    const userAccountInfo = await prisma.usuarios.findFirst({
      where: { id_rol: userId }
    })

    if (!userAccountInfo) {
      throw new Error('Usuario no encontrado.')
    }

    return userAccountInfo
  } catch (error) {
    console.error('Error al buscar al usuario: ', error)
    throw error
  }
}

// *Servicio que me trae todos los usuarios con el rol Admin
export const getAllUsersService = async () => {
  try {
    const users = await prisma.usuarios.findMany({
      where: { id_rol: 1 },
      select: {
        id_users: true,
        documentType: { select: { name: true } },
        document: true,
        name: true,
        department: { select: { name: true } },
        city: { select: { name: true } },
        address: true,
        phone: true,
        email: true,
        id_rol: true,
        status: true
      }
    })
    if (!users) {
      throw new Error('0 users found in the database.')
    }
    return users
  } catch (error) {
    console.error('Error searching users information: ', error)
    throw error
  }
}

// *Servicio que me trae todos los usuarios con el rol Client
export const getAllClientsService = async () => {
  try {
    const users = await prisma.usuarios.findMany({
      where: { id_rol: 2 },
      select: {
        id_users: true,
        documentType: { select: { name: true } },
        document: true,
        name: true,
        department: { select: { name: true } },
        city: { select: { name: true } },
        address: true,
        phone: true,
        email: true,
        id_rol: true,
        status: true
      }
    })
    if (!users) {
      throw new Error('0 users found in the database.')
    }
    return users
  } catch (error) {
    console.error('Error searching users information: ', error)
    throw error
  }
}
