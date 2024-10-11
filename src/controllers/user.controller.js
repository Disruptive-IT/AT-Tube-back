import {
  getUserAccountService,
  getAllUsersService,
  getAllClientsService,
  createNewUserService
} from '../services/user.service.js'



// ?Controlador que se utiliza para un usuario nuevo
export const createNewUserController = async (req, res) => {
  try {
    const userAccount = await createNewUserService(req.body)
    res.status(200).json({ message: 'Administrador Creado correctamente', nuevoUsuario: userAccount})
  } catch (error) {
    if (error.message === 'Duplicate Email') {
      return res.status(404).json({ message: 'El Email que ingresaste ya esta registrado, verifica y vuelve a intentarlo' });
    }
    console.error('Error al crear el usuario', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador para traer un usuario es especifico
export const getUserAccount = async (req, res) => {
  try {
    const useId = parseInt(req.params.id)
    const userAccount = await getUserAccountService(useId)
    res.status(200).json({ message: 'Usuario Encontrado.', user_account: userAccount })
  } catch (error) {
    console.error('Error buscando el usuario solicitado:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador para traer todos los usuarios Admin
export const getAllUsers = async (req, res) => {
  try {
    const systemUsers = await getAllUsersService()
    res.status(200).json({ systemUsers })
  } catch (error) {
    console.error('Error searching user account information:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador para traer todos los usuarios clients
export const getAllClients = async (req, res) => {
  try {
    const systemUsers = await getAllClientsService()
    res.status(200).json({ systemUsers })
  } catch (error) {
    console.error('Error searching user account information:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}