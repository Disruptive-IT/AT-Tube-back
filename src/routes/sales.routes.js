import express from 'express'
import { getUserPurchasesController } from '../controllers/sales.controller.js'

const router = express.Router()

router.post('/getUserPurchases', getUserPurchasesController) // ?Actualizar contraseña

export default router
