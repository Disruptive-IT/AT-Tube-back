import { Router } from 'express'
import userRoutes from './user.routes.js'
import profileRoutes from './profile.routes.js'
import authRoutes from './auth.routes.js'
import salesRoutes from './sales.routes.js'

const routes = Router()

// !Archivo donde administro todas las rutas de todos los modulos.
routes.use('/admin', userRoutes)
routes.use('/profile', profileRoutes)
routes.use('/auth', authRoutes)
routes.use('/sales', salesRoutes)

export default routes
