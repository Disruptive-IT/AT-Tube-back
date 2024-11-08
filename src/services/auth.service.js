import bcrypt from 'bcryptjs'
// import { google } from 'googleapis'
// import jwt from 'jsonwebtoken'
// import generateJWT from '../helpers/generateJWT.js'

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
// const requestCount = {} // Contador de solicitudes por dirección IP
// const REQUEST_LIMIT = 5 // Limite de intentos
// const TIME_WINDOW = 15 * 60 * 1000 // Ventana de tiempo en milisegundos (15 minutos)

// // Función para controlar la tasa de solicitudes
// const rateLimiter = (ip) => {
//   const currentTime = Date.now()

//   if (!requestCount[ip]) {
//     requestCount[ip] = { count: 1, firstRequestTime: currentTime }
//   } else {
//     requestCount[ip].count++

//     // Si ha pasado el tiempo de la ventana, reinicia el contador
//     if (currentTime - requestCount[ip].firstRequestTime > TIME_WINDOW) {
//       requestCount[ip] = { count: 1, firstRequestTime: currentTime }
//     }
//   }

//   return requestCount[ip].count <= REQUEST_LIMIT
// }

// forgotPassword - Genera y envía el token de recuperación
// export const forgotPassword = async (email) => {
//   try {
//     // Buscar al usuario por email
//     const user = await prisma.Users.findUnique({ where: { email } })
//     if (!user) {
//       throw new Error('User not found')
//     }

//     // Generar el token JWT con el ID del usuario en el payload
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
//       expiresIn: '1d'
//     })

//     console.log('Generated Token:', token) // Verificar que el token incluye el userId

//     // Llamar a la función sendRecoverEmail para enviar el token al usuario
//     const mail = await sendRecoverEmail(email, token, user.id)

//     if (!mail.accepted || mail.accepted.length === 0) {
//       throw new Error('Error sending recovery email')
//     }

//     return { success: true, message: 'Recovery email sent successfully' }
//   } catch (error) {
//     throw new Error(error.message)
//   }
// }

// // Cambia la firma de recoverPassword para recibir los parámetros directamente
// export const recoverPassword = async (confirmPassword, token) => {
//   if (!confirmPassword || !token) {
//     return { Status: 'Error', message: 'El campo confirmPassword y token son obligatorios.' }
//   }

//   try {
//     // Verificar el token JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)
//     console.log('Decoded Token:', decoded) // Verificar que el userId esté presente

//     if (!decoded || !decoded.userId) {
//       return { Status: 'Error', message: 'Token inválido o expirado.' }
//     }

//     // Generar hash de la nueva contraseña
//     const saltRounds = 10
//     const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds)

//     // Actualizar la contraseña en la base de datos con el ID del usuario decodificado
//     await prisma.Users.update({
//       where: { id: decoded.userId },
//       data: { password: hashedPassword }
//     })

//     return { Status: 'Success', message: 'Contraseña actualizada correctamente' }
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       console.error('Token ha expirado.')
//       return { Status: 'Error', message: 'El token ha expirado.' }
//     } else if (error.name === 'JsonWebTokenError') {
//       console.error('Token inválido.')
//       return { Status: 'Error', message: 'Token inválido.' }
//     } else {
//       console.error('Error inesperado:', error.message)
//       return { Status: 'Error', message: 'Error inesperado en la recuperación de contraseña.' }
//     }
//   }
// }
