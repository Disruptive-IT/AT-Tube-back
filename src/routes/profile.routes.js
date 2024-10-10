import express from 'express'
import { updateUserPasswordController } from '../controllers/profile.controller.js'

const router = express.Router()

router.get('/updatepassword', updateUserPasswordController)

export default router
