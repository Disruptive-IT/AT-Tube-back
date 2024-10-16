import bcrypt from 'bcryptjs'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const userRegisterService = async (userInformation) => {
  try {
    const {
      documentTypeId,
      document,
      name,
      departament,
      city,
      address,
      phone,
      email,
      password,
      roleId,
      status
    } = userInformation

    // Verifica los campos requeridos
    const requiredFields = ['email', 'document', 'name', 'password', 'documentTypeId', 'roleId', 'status', 'city', 'departament', 'address', 'phone', 'documentTypeId']

    requiredFields.forEach((field) => {
      if (!eval(field)) {
        throw new Error(`El campo "${field}" es requerido para el registro del usuario.`);
      }
    });

    // Verifica si ya existe un usuario con el correo o documento
    const existingUser = await prisma.Users.findFirst({
      where: {
        OR: [{ email }, { document }]
      }
    })

    if (existingUser) {
      // Diferencia entre el tipo de duplicación
      if (existingUser.email === email) {
        throw new Error('Ya hay un usuario registrado con ese correo electrónico.')
      }
      if (existingUser.document === document) {
        throw new Error('Ya hay un usuario registrado con ese número de documento.')
      }
    }

    // Hash de la contraseña
    const hashPassword = await bcrypt.hash(password, 10)

    // Crear el nuevo usuario
    const newUser = await prisma.users.create({
      data: {
        document_type: documentTypeId,
        document,
        name,
        id_department: departament,
        id_city: city,
        address,
        phone,
        email,
        password: hashPassword,
        id_rol: roleId,
        status,
      },
      select: {
        id_users: true,
        name: true,
        id_department: true,
        id_city: true,
        address: true,
        email: true,
        role: true
      }
    })

    return newUser
  } catch (error) {
    // Mejor manejo de errores
    console.error('Error creating new user: ', error.message)
    throw new Error(`Error en el registro del usuario: ${error.message}`)
  }
}

export async function userLoginService(email, password) {
  try {
    // Busca la información del usuario junto con su rol y contraseña
    const userSearch = await prisma.users.findFirst({
      where: { email },
      select: {
        id_users: true, // ID del usuario
        email: true, // Email del usuario
        name: true, // Nombre del usuario
        password: true, // Contraseña del usuario
        role: {
          select: {
            name: true // Nombre del rol (relación con Roles)
          }
        }
      }
    })

    // Verifica si el usuario existe
    if (!userSearch) {
      throw new Error('Usuario o contraseña incorrectos.') // Mensaje genérico por seguridad
    }

    // Verifica la contraseña del usuario
    const passwordValidation = await bcrypt.compare(password, userSearch.password)

    if (!passwordValidation) {
      throw new Error('Usuario o contraseña incorrectos.') // Mensaje genérico por seguridad
    }

    // Transforma los datos para devolver solo lo necesario
    const transformedUserSearch = {
      id: userSearch.id_users,
      name: userSearch.name,
      role: userSearch.role?.name // Extrae solo el nombre del rol
    }

    return transformedUserSearch
  } catch (error) {
    console.error('Error en userLoginService:', error.message) // Maneja el error de forma más específica
    throw new Error(`Error en el inicio de sesión: ${error.message}`)
  }
}
