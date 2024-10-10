import { UpdatePassword } from '../services/profile.service.js'

export const updateUserPasswordController = async (req, res) => {
  try {
    const useId = parseInt(req.params.id)
    const password = req.params.password

    const userAccount = await UpdatePassword(useId, password)

    res.status(200).json({ message: 'Contraseña Actualizada Exitosamente', user_account: userAccount })
  } catch (error) {
    console.error('Error al actualizar la contraseña', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
