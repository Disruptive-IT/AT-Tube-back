import { Router } from 'express'

import { userRegister, userLogin } from '../controllers/auth.controller.js'

const router = Router()

router.post('/auth/user/register', userRegister)

router.post('/auth/user/login', userLogin)

export default router
