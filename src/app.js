import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import passport from 'passport'
import session from 'express-session'

import './middlewares/authGoogle.js'

import { CorsConfig } from './lib/cors.config.js'
import routes from './routes/index.js'

// Carga las variables de entorno
dotenv.config()

const app = express()

// Configura el middleware de sesión antes de passport.initialize()
app.use(session({
  secret: process.env.SESSION_SECRET || 'tuSecretoSeguro', // Asegúrate de definir SESSION_SECRET en tu archivo .env
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambia a `true` si usas HTTPS
}))

// Middlewares
app.use(express.json())
app.use(express.static('public'))
app.use(cors(CorsConfig))
app.use('/uploads', express.static('uploads'))
app.use(passport.initialize())
app.use(passport.session())

// Rutas
app.use('/api', routes)

export default app
