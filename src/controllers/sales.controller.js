import { createPurchaseService, createTemplatesService, getUserPurchasesService } from '../services/sales.service.js'

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
    // Llama al servicio para crear la venta
    const newSale = await createPurchaseService(salesData)

    res.status(201).json({ message: 'Compra Generada exitosamente', newSale })
  } catch (error) {
    console.error(error)
    if (error.message.includes('Faltan campos obligatorios')) {
      res.status(400).json({ error: error.message })
    } else if (error.message.includes('no existe')) {
      res.status(404).json({ error: error.message })
    } else if (error.message.includes('no pertenece al usuario')) {
      res.status(403).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
