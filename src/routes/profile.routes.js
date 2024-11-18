import express from 'express'
import {
  updateUserPasswordController,
  updateUserController,
  updateUserStatusController,
  getUserAccountController
} from '../controllers/profile.controller.js'
import { authorizeAdmin } from '../middlewares/autorizeAdmin.js'


const router = express.Router()

router.post('/updatepassword', updateUserPasswordController) // ?Actualizar contraseña
router.post('/updateUser', updateUserController) // ?Actualizar información general usuarios
router.post('/updateUserStatus',authorizeAdmin, updateUserStatusController) // ?Actualizar estado del usuario
router.post('/getUserProfile', getUserAccountController)

export default router
