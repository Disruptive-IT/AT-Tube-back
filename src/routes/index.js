import { Router } from 'express'
import userRoutes from './user.routes.js'
import profileRoutes from './profile.routes.js'

const routes = Router()

// !Archivo donde administro todas las rutas de todos los modulos.
routes.use('/admin', userRoutes)
routes.use('/profile', profileRoutes)

export default routes
