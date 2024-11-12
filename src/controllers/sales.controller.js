import { createPurchaseService, createTemplatesService, getAllPurchasesService, getUserPurchasesService, updatePurchaseToPayService } from '../services/sales.service.js'

// ?Controller to get all purchases orders for a especific user
export const getUserPurchasesController = async (req, res) => {
  try {
    const userPurchases = await getUserPurchasesService(req.body.id)
    res.status(200).json({ message: 'Compras Traidas con exito', purchases: userPurchases })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar la contraseña.' })
    }
    console.error('can`t get purchases', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

export const getAllPurchasesController = async (req, res) => {
  try {
    const currentDate =req.body.currentDate
    const sinceDate=req.body.sinceDate
    const Purchases = await getAllPurchasesService(currentDate, sinceDate)
    res.status(200).json({ message: 'Compras Traidas con exito', purchases: Purchases })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar la contraseña.' })
    }
    console.error('can`t get purchases', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

// ?Controller to create a new template
export const createTemplateController = async (req, res) => {
  try {
    const template = await createTemplatesService(req.body)
    res.status(200).json({ message: 'Diseño creado exitosamente', template })
  } catch (error) {
    console.error('No se pudo crear el diseño', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

// ?Controller to create a new purchase order
export const createPurchaseController = async (req, res) => {
  const salesData = req.body
  try {
    const newSale = await createPurchaseService(salesData)
    res.status(201).json({ message: 'Compra Generada exitosamente', newSale })
  } catch (error) {
    console.error(error)

    switch (error.name) {
      case 'MissingFieldsError':
      case 'InvalidTotalPriceError':
        return res.status(400).json({ error: error.message })
      case 'NotFoundError':
        return res.status(404).json({ error: error.message })
      case 'ForbiddenError':
        return res.status(403).json({ error: error.message })
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const updatePurchaseToPayController = async (req, res) => {
  const data = req.body
  try {
    const newSale = await updatePurchaseToPayService(data)
    res.status(201).json({ message: 'La cotización se realizó con éxito, ahora puedes proceder con el pago.', newSale })
  } catch (error) {
    console.error(error)
    switch (error.name) {
      case 'MissingFieldsError':
      case 'InvalidTotalPriceError':
        return res.status(400).json({ error: error.message })
      case 'NotFoundError':
        return res.status(404).json({ error: error.message })
      case 'ForbiddenError':
        return res.status(403).json({ error: error.message })
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const updatePurchaseToProduction = async (req, res) => {
  const purchaseData = req.body
}

export const updatePurchaseToShipped = async (req, res) => {
  const purchaseData = req.body
}

export const updatePurchaseToDelivered = async (req, res) => {
  const purchaseData = req.body
}

export const updatePurchaseToCanceled = async (req, res) => {
  const purchaseData = req.body
}
