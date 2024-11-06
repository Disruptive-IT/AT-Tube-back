import { createTemplatesService, getUserPurchasesService } from '../services/sales.service.js'

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

export const createTemplateController = async (req, res) => {
  console.log(req.body)
  try {
    const teplate = await createTemplatesService(req.body)
    res.status(200).json({ message: 'Diseño creado exitosamente', teplate })
  } catch (error) {
    console.error('can`t get purchases', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}
