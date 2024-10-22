import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendRecoverEmail } from './mails.service.js'
import { google } from 'googleapis'

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
    // Busca la información del usuario junto con su rol y contraseña
    const userSearch = await prisma.Users.findFirst({
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

export const forgotPassword = async (email) => {
  try {
    // Buscar al usuario por email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('User not existed')
    }

    // Generar el token JWT con el ID del usuario
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    // Llamar a la función sendRecoverEmail con el email y el token
    const mail = await sendRecoverEmail(email, token, user.id)

    // Verificar si el correo fue enviado
    if (!mail.accepted || mail.accepted.length === 0) {
      throw new Error('Error sending recovery email')
    }

    return { success: true, message: 'Recovery email sent successfully' }
  } catch (error) {
    throw new Error(error.message)
  }
}

export const recoverPassword = async (confirmPassword, token) => {
  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded || !decoded.userId) {
      throw new Error('Invalid or expired token')
    }

    // Generar hash de la nueva contraseña
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds)

    // Actualizar la contraseña en la base de datos
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    })

    return { status: 'Success' }
  } catch (error) {
    throw new Error(error.message)
  }
}

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
)

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
]

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true,
  prompt: 'consent'
})

export const googleauth = async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Referrer-Policy', 'no-referrer-when-downgrade')
  res.redirect(authorizationUrl)
}

export const googleCallback = async (req, res) => {
  const { code } = req.query

  try {
    // Obtener tokens de acceso usando el código de autenticación proporcionado
    const { tokens } = await oauth2Client.getToken(code)

    // Configurar el cliente con las credenciales
    oauth2Client.setCredentials(tokens)

    // Obtener información del usuario autenticado
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    })

    const { data } = await oauth2.userinfo.get()

    // Aquí puedes procesar la información del usuario
    console.log('Datos del usuario:', data)

    // Verificar si se obtuvo un token de acceso antes de la redirección
    if (tokens.access_token) {
      // Redirigir a una URL después de la autenticación
      return res.redirect(`http://localhost:3000/home?token=${tokens.access_token}`)
    } else {
      throw new Error('No se obtuvo el token de acceso')
    }
  } catch (error) {
    console.error('Error al autenticar con Google:', error)
    res.status(500).json({ message: 'Error en la autenticación' })
  }
}
