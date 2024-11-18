import express from 'express'
import {
  createPurchaseController,
  createTemplateController,
  getAllPurchasesController,
  getUserPurchasesController,
  getYearsPurchasesController,
  updatePurchaseToPayController
} from '../controllers/sales.controller.js'

const router = express.Router()

router.post('/getUserPurchases', getUserPurchasesController) // ?get all purchases of the especific customer
router.post('/getAllPurchases', getAllPurchasesController) // ?get all purchases
router.get('/getYears', getYearsPurchasesController)
router.post('/newTemplate', createTemplateController) // ?Create new template
router.post('/newPurchase', createPurchaseController) // ?Create new purchase
router.post('/updatePurchaseToPay', updatePurchaseToPayController) // ?Update the quote so the user can pay

export default router
