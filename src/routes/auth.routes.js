import { Router } from 'express'

import { userRegister, userLogin } from '../controllers/auth.controller.js'

const router = Router()

router.post('/user/register', userRegister)

router.post('/user/login', userLogin)

export default router
