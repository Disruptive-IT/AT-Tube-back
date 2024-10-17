import { Router } from 'express'

import { userRegister, userLogin, userLogout, forgotPasswordController, recoverPasswordController, googleAuthController, googleCallbackController } from '../controllers/auth.controller.js'

const router = Router()

router.post('/register', userRegister)

router.post('/login', userLogin)

router.post('/logout', userLogout)

router.post('/forgot-password', forgotPasswordController)

router.post('/recover-password', recoverPasswordController)

// Rutas de autentificacion con google
router.get('/google', googleAuthController)

router.get('/google/callback', googleCallbackController)

export default router
