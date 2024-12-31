import express from 'express'
import {
  createPurchaseController,
  createTemplateController,
  getAllPurchasesController,
  getUserPurchasesController,
  getUserTemplateController,
  getYearsPurchasesController,
  updatePurchaseToPayController,
  updateSaleToProductionController,
  updateStatusPurchaseController,
  UpdateTemplateController,
  updateToCancelPurchaseController,
  notifyPendingDesignsController
} from '../controllers/sales.controller.js'
import { authorizeClient } from '../middlewares/AutorizeClient.js'
const router = express.Router()

router.post('/getUserPurchases', getUserPurchasesController) // ?get all purchases of the especific customer
router.post('/getAllPurchases', getAllPurchasesController) // ?get all purchases
router.get('/getYears', getYearsPurchasesController)
router.post('/newTemplate', createTemplateController) // ?Create new template
router.post('/updateTemplate', UpdateTemplateController) // ?update template
router.post('/newPurchase', createPurchaseController) // ?Create new purchase
router.post('/updatePurchaseToPay', updatePurchaseToPayController) // ?Update the quote so the user can pay
router.post('/updatePurchaseToCancel', updateToCancelPurchaseController) // ?Update the quote so the user can pay
router.post('/updateStatusPurchase', updateStatusPurchaseController) // ?Update purchase to delivered, shipping and cancel
router.get('/getUserTemplates', getUserTemplateController) // ?Update purchase to delivered, shipping and cancel
router.post('/updatePurchaseToProduction', updateSaleToProductionController) // ?update paiment after pay
router.get('/notify-pending-designs/:userId', notifyPendingDesignsController)

export default router
