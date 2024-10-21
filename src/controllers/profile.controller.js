import { UpdatePasswordService, UpdateUserService, UpdateStateUserService } from '../services/profile.service.js'

// ?Controlador que se utiliza para cambiar contraseñas en los perfiles
export const updateUserPasswordController = async (req, res) => {
  try {
    const userAccount = await UpdatePasswordService(req.body.id, req.body.password)
    res.status(200).json({ message: 'Contraseña Actualizada Exitosamente', user_account: userAccount })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar la contraseña.' })
    }
    console.error('Error al actualizar la contraseña', error)
    return res.status(500).json({ message: 'Internal server error.', error: error.message })
  }
}

// ?Controlador que se utiliza para actualizar la informacion en los perfiles
export const updateUserController = async (req, res) => {
  try {
    const userAccount = await UpdateUserService(req.body)
    res.status(200).json({ message:`${userAccount.name} Actualizad@ exitosamente`, userAccount })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar.'})
    }
    console.error('Error al actualizar el Usuario:', error)
    return res.status(500).json({ message: 'Internal server error.', error: error.message })
  }
}

// ?Controlador que se utiliza para actualizar la informacion en los perfiles
export const updateUserStatusController = async (req, res) => {
  try {
    const userAccount = await UpdateStateUserService(req.body)
    res.status(200).json({ message: 'Estado Actualizado exitosamente', usuario:userAccount })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar estado.' })
    }
    console.error('Error al actualizar el Usuario', error)
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message })
  }
}