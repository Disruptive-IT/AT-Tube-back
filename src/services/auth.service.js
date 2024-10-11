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

    // Verifica si falta información requerida
    if (!email || !documentNumber || !name || !password || !documentTypeId || !roleId) {
      throw new Error('Faltan campos requeridos para el registro del usuario.')
    }

    // Verifica si ya existe un usuario con el correo o documento en una sola consulta
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { documentNumber }
        ]
      }
    })

    if (existingUser) {
      // Diferencia entre el tipo de duplicación
      if (existingUser.email === email) {
        throw new Error('Ya hay un usuario registrado con ese correo electrónico.')
      }
      if (existingUser.documentNumber === documentNumber) {
        throw new Error('Ya hay un usuario registrado con ese número de documento.')
      }
    }

    // Hash de la contraseña
    const hashPassword = await bcrypt.hash(password, 10)

    // Crear el nuevo usuario
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
        role: { connect: { id: roleId } },
        status,
        credentials: {
          create: { password: hashPassword } // Asegúrate de que tienes un modelo relacionado con credenciales
        }
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

    return newUser
  } catch (error) {
    // Mejor manejo de errores con tipos de respuesta específicos
    console.error('Error creating new user: ', error.message)
    throw new Error(`Error en el registro del usuario: ${error.message}`)
  }
}

export async function userLoginService (email, password) {
  try {
    // Busca la información del usuario junto con sus credenciales en una sola consulta
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
        },
        credentials: {
          select: {
            password: true
          }
        }
      }
    })

    // Verifica si el usuario existe
    if (!userSearch) {
      throw new Error('Usuario o contraseña incorrectos.') // Mensaje genérico por seguridad
    }

    // Verifica la contraseña del usuario
    const passwordValidation = await bcrypt.compare(password, userSearch.credentials.password)

    if (!passwordValidation) {
      throw new Error('Usuario o contraseña incorrectos.') // Mensaje genérico por seguridad
    }

    // Transforma los datos para devolver solo lo necesario
    const transformedUserSearch = {
      id: userSearch.id,
      name: userSearch.name,
      lastName: userSearch.last_name,
      role: userSearch.role?.name // Extrae solo el nombre del rol
    }

    return transformedUserSearch
  } catch (error) {
    console.error('Error en userLoginService:', error.message) // Maneja el error de forma más específica
    throw new Error(`Error en el inicio de sesión: ${error.message}`)
  }
}
