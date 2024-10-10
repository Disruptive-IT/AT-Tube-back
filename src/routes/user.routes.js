import express from 'express'
import { getUserAccount, getAllUsers, getAllClients } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/allUsers', getAllUsers)
router.get('/allClients', getAllClients)
router.post('/user', getUserAccount)

export default router
