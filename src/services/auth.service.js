import bcrypt from 'bcryptjs'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const userRegisterService = async (userInformation) => {
  try {
    const {
      documentTypeId,
      document,
      name,
      country,
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
      if (!userInformation[field]) {
        throw new Error(`El campo "${field}" es requerido para el registro del usuario.`)
      }
    })

    // Verifica si ya existe un usuario con el mismo correo
    const existingEmailUser = await prisma.Users.findFirst({
      where: { email }
    })

    if (existingEmailUser) {
      throw new Error('Ya hay un usuario registrado con ese correo electrónico.')
    }

    // Verifica si ya existe un usuario con el mismo tipo de documento y número de documento
    const existingDocumentUser = await prisma.Users.findFirst({
      where: {
        AND: [
          { document_type: documentTypeId }, // Tipo de documento
          { document } // Número de documento
        ]
      }
    })

    if (existingDocumentUser) {
      throw new Error('Ya hay un usuario registrado con ese tipo y número de documento.')
    }

    // Hash de la contraseña
    const hashPassword = await bcrypt.hash(password, 10)

    // Crear el nuevo usuario
    const newUser = await prisma.Users.create({
      data: {
        document_type: documentTypeId,
        document,
        name,
        id_country: country,
        id_department: departament,
        id_city: city,
        address,
        phone,
        email,
        password: hashPassword,
        id_rol: roleId,
        status
      },
      select: {
        id_users: true,
        name: true,
        id_country: true,
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

export async function userLoginService (email, password) {
  try {
    // Busca la información del usuario por email, independientemente del estado
    const userSearch = await prisma.Users.findFirst({
      where: { email },
      select: {
        id_users: true, // ID del usuario
        email: true, // Email del usuario
        name: true, // Nombre del usuario
        phone: true,
        documentType: { select: { name: true, id_document_type: true } }, // Relación con DocumentType
        document: true, // Número de documento
        country: { select: { name: true, id_country: true } },
        department: { select: { name: true, id_department: true } },
        city: { select: { name: true, id_city: true } },
        address: true,
        avatar: true, // Avatar del usuario
        password: true, // Contraseña del usuario
        status: true,
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

    // Verifica si el usuario está inactivo
    if (!userSearch.status) {
      throw new Error('El usuario está inactivo.') // Mensaje específico para usuarios inactivos
    }

    // Verifica la contraseña del usuario
    const passwordValidation = await bcrypt.compare(password, userSearch.password)

    if (!passwordValidation) {
      throw new Error('Usuario o contraseña incorrectos.') // Mensaje genérico por seguridad
    }

    // Transforma los datos para devolver solo lo necesario
    const transformedUserSearch = {
      id: userSearch.id_users,
      avatar: userSearch.avatar,
      name: userSearch.name,
      email: userSearch.email,
      role: userSearch.role?.name // Extrae solo el nombre del rol
    }

    return transformedUserSearch
  } catch (error) {
    console.error('Error en userLoginService:', error.message) // Maneja el error de forma más específica
    throw new Error(`Error en el inicio de sesión: ${error.message}`)
  }
}

export const logout = (req, res) => {
  try {
    res.clearCookie('token', {
      sameSite: 'Lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: req.hostname,
      path: '/'
    })
    res.status(200).json({ message: 'Successfully logged out' })
  } catch (err) {
    res.status(500).json({ message: 'Error in server', err })
  }
}
