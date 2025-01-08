import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from './mails.service.js'
import jwt from 'jsonwebtoken'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const userRegisterService = async (userInformation) => {
  try {
    const {
      documentTypeId,
      document,
      name,
      country,
      strCountry,
      departament,
      strDepartment,
      city,
      strCity,
      address,
      phone,
      email,
      password,
      roleId,
      status
    } = userInformation

    // Verifica los campos requeridos
    const requiredFields = [
      'email',
      'document',
      'name',
      'password',
      'documentTypeId',
      'roleId',
      'strCountry',
      'strDepartment',
      'strCity',
      'address',
      'phone'
    ]

    requiredFields.forEach((field) => {
      if (!userInformation[field]) {
        throw new Error(`El campo "${field}" es requerido para el registro del usuario.`)
      }
    })

    // Verifica si ya existe un usuario con el mismo correo
    const existingEmailUser = await prisma.Users.findFirst({ where: { email } })
    if (existingEmailUser) {
      throw new Error('Ya hay un usuario registrado con ese correo electrónico.')
    }

    // Verifica si ya existe un usuario con el mismo tipo de documento y número de documento
    const existingDocumentUser = await prisma.Users.findFirst({
      where: {
        AND: [{ document_type: documentTypeId }, { document }]
      }
    })

    if (existingDocumentUser) {
      throw new Error('Ya hay un usuario registrado con ese tipo y número de documento.')
    }

    // Hash de la contraseña
    const hashPassword = await bcrypt.hash(password, 10)

    // Usar una transacción para asegurar consistencia
    const newUser = await prisma.$transaction(async (prisma) => {
      const createdUser = await prisma.Users.create({
        data: {
          document_type: documentTypeId,
          document,
          name,
          str_country: strCountry,
          str_Department: strDepartment,
          str_city: strCity,
          id_country: country,
          id_department: parseInt(departament),
          id_city: city,
          address,
          phone,
          email,
          password: hashPassword,
          id_rol: roleId,
          status,
          is_verified: false
        },
        select: {
          id_users: true,
          name: true,
          id_country: true,
          id_department: true,
          id_city: true,
          address: true,
          email: true,
          role: true,
          is_verified: true
        }
      })

      // Intentar enviar el correo de verificación
      try {
        await sendVerificationEmail(createdUser)
      } catch (error) {
        console.error('Error enviando correo de verificación:', error.message)
        throw new Error('No se pudo enviar el correo de verificación.')
      }

      return createdUser
    })

    return newUser
  } catch (error) {
    console.error('Error en el registro del usuario:', error.message)
    throw new Error(`Error en el registro del usuario: ${error.message}`)
  }
}

export const verifyAccountService = async (token) => {
  try {
    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // eslint-disable-next-line no-unused-vars
    const { userId, email } = decoded

    // Verificar si el usuario ya está verificado
    const user = await prisma.Users.findUnique({
      where: { id_users: userId }
    })

    if (!user) {
      throw new Error('Usuario no encontrado.')
    }

    if (user.is_verified) {
      throw new Error('La cuenta ya ha sido verificada.')
    }

    // Actualizar el campo is_verified
    const updatedUser = await prisma.Users.update({
      where: { id_users: userId },
      data: { is_verified: true }
    })

    return { message: 'Cuenta verificada exitosamente.', user: updatedUser }
  } catch (error) {
    console.error('Error verificando cuenta: ', error.message)
    throw new Error('Token inválido o expirado.')
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
        country: { select: { name: true, id_country: true, currency: true, locale: true, phone_code: true, flag_code: true } },
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
      locale: userSearch.country.locale,
      flag_code: userSearch.country.flag_code,
      currency: userSearch.country.currency,
      phone_code: userSearch.country.phone_code,
      role: userSearch.role?.name // Extrae solo el nombre del rol
    }

    return transformedUserSearch
  } catch (error) {
    console.error('Error en userLoginService:', error.message) // Maneja el error de forma más específica
    throw new Error(`Error en el inicio de sesión: ${error.message}`)
  }
}

export const loginGoogleService = async (token) => {
  if (!token) {
    throw new Error('Token is required')
  }

  try {
    // Decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('Decoded token:', decoded)
    const userId = decoded.id // El ID del usuario contenido en el token

    // Buscar al usuario en la base de datos usando `id_users`
    const userSearch = await prisma.users.findUnique({
      where: { id_users: userId },
      include: {
        country: true, // Relación con el modelo Country
        role: true // Relación con el modelo Role
      }
    })

    if (!userSearch) {
      throw new Error('User not found')
    }

    // Transformar los datos del usuario
    const transformedUserSearch = {
      id: userSearch.id_users,
      avatar: userSearch.avatar,
      name: userSearch.name,
      email: userSearch.email,
      locale: userSearch.country?.locale,
      flag_code: userSearch.country?.flag_code,
      currency: userSearch.country?.currency,
      phone_code: userSearch.country?.phone_code,
      role: userSearch.role?.name // Extrae solo el nombre del rol
    }

    return transformedUserSearch
  } catch (error) {
    console.error('Error decoding token:', error)
    throw new Error('Invalid or expired token')
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
