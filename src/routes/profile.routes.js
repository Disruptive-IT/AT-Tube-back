import express from 'express'
import { updateUserPasswordController, updateUserController, updateUserStatusController } from '../controllers/profile.controller.js'

const router = express.Router()

router.post('/updatepassword', updateUserPasswordController) // ?Actualizar contraseña
router.post('/updateUser', updateUserController) // ?Actualizar información general usuarios
router.post('/updateUserStatus', updateUserStatusController) // ?Actualizar estado del usuario


export default router
