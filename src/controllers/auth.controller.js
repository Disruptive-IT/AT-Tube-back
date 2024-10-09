import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

import jwt from 'jsonwebtoken';

import { userRegisterService } from '../services/auth.service.js'

import { createToken, verifyToken } from '../middlewares/jwt.js'

const secretKey = process.env.JWT_SECRET

const prisma = new PrismaClient()

export const userRegister = async (req, res) => {
  try {
    const user = req.body
    const newUser = await userRegisterService(user)

    const accessToken = await createToken({ id: newUser.user_id, role: newUser.role.name })

    res.cookie('accessToken', accessToken)

    console.log('- Un nuevo usuario se ha registrado en el sistema.', newUser)
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser, accessToken: accessToken })
  } catch (error) {
    console.error('Error en el registro de usuario: ', error)
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message })
  }
}
