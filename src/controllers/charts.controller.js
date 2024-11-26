import { getSatatusSalesDataService, getTotalPurchasesDataService } from '../services/charts.service.js'

export const getSatatusSalesDataController = async (req, res) => {
  const year = req.query.year
  try {
    const statusSalesData = await getSatatusSalesDataService(year)
    res.status(200).json({ message: 'informe traido con exito', statusSalesData })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getTotalPurchasesDataController = async (req, res) => {
  try {
    const salesData = await getTotalPurchasesDataService()
    res.status(200).json({ message: 'informe traido con exito', salesData })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
