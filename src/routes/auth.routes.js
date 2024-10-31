import { Router } from 'express'
import passport from 'passport'
import {
  userRegister,
  userLogin,
  userLogout,
  forgotPasswordController,
  recoverPasswordController
} from '../controllers/auth.controller.js'

const router = Router()

// Rutas para la gestión de usuarios
router.post('/register', userRegister)
router.post('/login', userLogin)
router.post('/logout', userLogout)
router.post('/forgot-password', forgotPasswordController)
router.post('/recover-password', recoverPasswordController)

// Rutas de autenticación con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/')
  }
)

// Manejo de errores (opcional)
router.use((err, req, res, next) => {
  console.error('Error in authentication:', err)
  res.status(500).json({ message: 'An error occurred during authentication.' })
})

export default router
