import { getUserPurchasesService } from '../services/sales.service.js'

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
