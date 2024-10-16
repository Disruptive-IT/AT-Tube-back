import express from 'express'
import {
  getAllUsers,
  getAllClients,
  createNewUserController,
  deleteUser
} from '../controllers/user.controller.js'

const router = express.Router()

router.get('/allUsers', getAllUsers)
router.get('/allClients', getAllClients)
router.post('/newuseradmin', createNewUserController)
router.delete('/deleteUser', deleteUser)

export default router
