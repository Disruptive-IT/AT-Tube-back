import { Router } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import {
  userRegister,
  userLogin,
  userLogout,
  requestPasswordReset,
  resetPassword
} from '../controllers/auth.controller.js'

const router = Router()

// Rutas para la gestión de usuarios
router.post('/register', userRegister)
router.post('/login', userLogin)
router.post('/logout', userLogout)
router.post('/forgot-password', requestPasswordReset)
router.post('/reset-password/:token', resetPassword)

// Rutas de autenticación con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Genera el token JWT
    const token = jwt.sign(
      { id: req.user.id_users },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
      maxAge: 3600000 // 1 hora
    })

    res.redirect(process.env.URL_WEBAPP)
  }
)

export default router
