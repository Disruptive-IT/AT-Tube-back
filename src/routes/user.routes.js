import express from 'express'
import { 
    getAllUsers, 
    getAllClients,
    createNewUserController 
} from '../controllers/user.controller.js'

const router = express.Router()

router.get('/allUsers', getAllUsers)
router.get('/allClients', getAllClients)
router.post('/newuseradmin', createNewUserController)

export default router
