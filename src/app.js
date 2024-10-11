import express from 'express'
import cors from 'cors'
import { CorsConfig } from './lib/cors.config.js'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(cors(CorsConfig))

export default app
