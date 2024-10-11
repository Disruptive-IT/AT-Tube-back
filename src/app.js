import express from 'express'
import cors from 'cors'
import { CorsConfig } from './lib/cors.config.js'
import routes from './routes/index.js'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use('/api', routes)

export default app
