import express from 'express'
import {
  createPurchaseController,
  createTemplateController,
  getUserPurchasesController
} from '../controllers/sales.controller.js'

const router = express.Router()

router.post('/getUserPurchases', getUserPurchasesController) // ?get all purchases of the especific customer
router.post('/newTemplate', createTemplateController) // ?Create new template
router.post('/newPurchase', createPurchaseController) // ?Create new purchase

export default router
