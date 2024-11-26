import { Router } from 'express'
import { getSatatusSalesDataController, getTotalPurchasesDataController } from '../controllers/charts.controller.js'

const router = Router()

router.get('/salesStatusInform', getSatatusSalesDataController)
router.get('/salesInform', getTotalPurchasesDataController)

export default router
