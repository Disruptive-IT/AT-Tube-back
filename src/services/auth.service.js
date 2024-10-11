import bcrypt from 'bcrypt'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const userRegisterService = async (userInformation) => {
  try {
    const {
      documentTypeId,
      documentNumber,
      name,
      departament,
      city,
      adress,
      phone,
      email,
      password,
      roleId,
      status
    } = userInformation

    const verifyIfUserExists = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (verifyIfUserExists) {
      throw new Error('Ya hay un usuario registrado en el sistema con ese correo electrónico.')
    }

    const verifyIfDocumentExists = await prisma.user.findFirst({
      where: {
        documentNumber
      }
    })

    if (verifyIfDocumentExists) {
      throw new Error('Ya hay un usuario registrado en el sistema con ese número de documento.')
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        document_types: { connect: { id: documentTypeId } },
        documentNumber,
        name,
        departament,
        city,
        adress,
        phone,
        email,
        password,
        role: { connect: { id: roleId } },
        status,
        credentials: { create: { password: hashPassword } }
      },
      select: {
        id: true,
        name: true,
        departament: true,
        city: true,
        adress: true,
        email: true,
        role: true
      }
    })
  } catch (error) {
    console.error('Error creating new user: ', error)
    throw error
  }
}

export async function userLoginService (email, password) {
  try {
    // Search user information
    const userSearch = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        last_name: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })

    if (!userSearch) {
      throw new Error('El usuario no se pudo encontrar en el sistema.')
    }

    // Search credentials
    const userCredentials = await prisma.credentials.findFirst({
      where: { user_id: userSearch.id },
      select: { password: true }
    })

    if (!userCredentials) {
      throw new Error('Credenciales no encontradas para el usuario.')
    }

    // Verify the user password
    const passwordValidation = await bcrypt.compare(password, userCredentials.password)

    if (!passwordValidation) {
      throw new Error('La contraseña es incorrecta.')
    }

    const transformedUserSearch = {
      ...userSearch,
      role: userSearch.role?.name // Agrega role_name fuera del array
    }

    return transformedUserSearch
  } catch (error) {
    console.error('Error en userLoginService:', error)
    throw error
  }
}
