import { userRegisterService, userLoginService, verifyAccountService } from '../services/auth.service.js'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

import jwt from 'jsonwebtoken'
import { createToken } from '../middlewares/jwt.js'
import { sendResetPasswordMail } from '../services/mails.service.js'

const secretKey = process.env.JWT_SECRET

const prisma = new PrismaClient()

export const userRegister = async (req, res) => {
  try {
    const user = req.body
    const newUser = await userRegisterService(user)

    const accessToken = await createToken({ id: newUser.user_id, role: newUser.role.name })

    res.cookie('accessToken', accessToken)

    console.log('- Un nuevo usuario se ha registrado en el sistema.', newUser)
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser, accessToken })
  } catch (error) {
    console.error('Error en el registro de usuario: ', error)
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message })
  }
}

export const verifyAccountController = async (req, res) => {
  try {
    const token = req.query.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token no proporcionado.'
      })
    }

    // Llama al servicio para verificar la cuenta
    await verifyAccountService(token)

    // Redirige al frontend
    return res.redirect(`${process.env.FRONTEND_URL}/auth/login`)
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

export const userLogin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' })
  }

  try {
    const user = await userLoginService(email, password)

    const accessToken = await createToken({ id: user.id, role: user.role })
    console.log(`El usuario con rol ${user.role} y ID ${user.id} acaba de iniciar sesión en el sistema.`)

    res.json({
      message: 'Inicio de sesión exitoso.',
      user,
      accessToken

    })
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    res.status(500).json({ message: 'Error interno del servidor', error: error.message })
  }
}

export const userLogout = (req, res) => {
  try {
    res.clearCookie('accessToken', {
      sameSite: 'Lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: req.hostname,
      path: '/'
    })
    res.status(200).json({ message: 'Cierre de sesión exitoso' })
  } catch (err) {
    console.error('Error al cerrar sesión: ', err)
    res.status(500).json({ message: 'Error en el servidor', error: err.message })
  }
}

// Controlador para la recuperación de contraseña
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body

  const user = await prisma.Users.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(404).json({ message: 'Usuario no registrado' })
  }

  const resetToken = jwt.sign({ user_id: user.id_users }, secretKey, { expiresIn: '10m' })
  // const resetLink = `http://localhost:3000/reset-password/${resetToken}`
  console.log(`El usuario ID ${user.id_users} (${user.email}) creó el token de restauración de contraseña con éxito.`)

  // Enviar correo electrónico con el token
  const sendMail = await sendResetPasswordMail(user, resetToken)
  res.status(200).json({ message: sendMail })
}

export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { newPassword, confirmPassword } = req.body

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' })
  }

  try {
    // Verifica si el token es válido
    const decoded = jwt.verify(token, secretKey)
    console.log('Token decodificado:', decoded) // Verifica que el token se decodifique correctamente

    const userId = decoded.user_id
    console.log('ID del usuario:', userId) // Verifica que el ID del usuario sea correcto

    // Verifica si el usuario existe con el userId extraído del token
    const user = await prisma.Users.findUnique({
      where: { id_users: userId }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    // Hashea la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualiza la contraseña del usuario
    await prisma.Users.update({
      where: { id_users: userId },
      data: { password: hashedPassword }
    })

    res.status(200).json({ message: 'Password has been reset successfully.' })
  } catch (err) {
    res.status(400).json({ message: 'Password reset token is invalid or has expired.', error: err.message })
  }
}
