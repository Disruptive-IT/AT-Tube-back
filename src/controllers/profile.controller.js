import { UpdatePasswordService, UpdateUserService, UpdateStateUserService } from '../services/profile.service.js'

// ?Controlador que se utiliza para cambiar contraseñas en los perfiles
export const updateUserPasswordController = async (req, res) => {
  try {
    const userAccount = await UpdatePasswordService(req.body.id, req.body.password)
    res.status(200).json({ message: 'Contraseña Actualizada Exitosamente', user_account: userAccount })
  } catch (error) {
    console.error('Error al actualizar la contraseña', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador que se utiliza para actualizar la informacion en los perfiles
export const updateUserController = async (req, res) => {
  try {
    const userAccount = await UpdateUserService(req.body)
    res.status(200).json({ message: 'Usuario Actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar el Usuario', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador que se utiliza para actualizar la informacion en los perfiles
export const updateUserStatusController = async (req, res) => {
  try {
    const userAccount = await UpdateStateUserService(req.body)
    res.status(200).json({ message: 'Estado Actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar el Usuario', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}