// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcrypt'

// import jwt from 'jsonwebtoken';

import { userRegisterService, userLoginService } from '../services/auth.service.js'

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
