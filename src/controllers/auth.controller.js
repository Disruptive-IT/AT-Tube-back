import { userRegisterService, userLoginService, forgotPassword, recoverPassword } from '../services/auth.service.js'

import { createToken } from '../middlewares/jwt.js'

// const prisma = new PrismaClient()

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
export const forgotPasswordController = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).send({ error: 'Email is required' })
  }

  try {
    const response = await forgotPassword(email)
    return res.status(200).json(response)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
}

export const recoverPasswordController = async (req, res) => {
  console.log('Contenido de req.body:', req.body)

  const { confirmPassword, token } = req.body

  if (!confirmPassword || !token) {
    return res.status(400).send({ error: 'Password and token are required' })
  }

  try {
    const response = await recoverPassword(confirmPassword, token)
    return res.status(200).json(response)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
}

