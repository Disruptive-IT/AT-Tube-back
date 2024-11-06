import express from 'express'
import { createTemplateController, getUserPurchasesController } from '../controllers/sales.controller.js'

const router = express.Router()

router.post('/getUserPurchases', getUserPurchasesController) // ?Actualizar contraseña
router.post('/newTemplate', createTemplateController)// ?Create new diseno

export default router
