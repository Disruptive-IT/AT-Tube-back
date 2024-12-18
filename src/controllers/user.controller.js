import {
  getAllUsersService,
  getAllClientsService,
  createNewUserService,
  DeleteUserService,
  getAllCountriesService,
  getAllCityService,
  getAllDepartmenService
} from '../services/user.service.js'

// ?Controlador que se utiliza para un usuario nuevo
export const createNewUserController = async (req, res) => {
  try {
    const userAccount = await createNewUserService(req.body)
    res.status(200).json({ message: 'Administrador Creado correctamente', nuevoUsuario: userAccount })
  } catch (error) {
    if (error.message === 'Duplicate Email') {
      return res.status(404).json({ message: 'El Email que ingresaste ya esta registrado, verifica y vuelve a intentarlo' })
    }
    console.error('Error al crear el usuario', error)
    return res.status(500).json({ message: 'Internal server error.', error })
  }
}

// ?Controlador para traer todos los usuarios Admin
export const getAllUsersController = async (req, res) => {
  const { page, limit, searchTerm } = req.query
  try {
    const systemUsers = await getAllUsersService(page, limit, searchTerm)
    res.status(200).json({ systemUsers })
  } catch (error) {
    console.error('Error searching user account information:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador para traer todos los usuarios clients
export const getAllClientsController = async (req, res) => {
  const { page, limit, searchTerm } = req.query
  try {
    const systemClients = await getAllClientsService(page, limit, searchTerm)
    res.status(200).json({ systemClients })
  } catch (error) {
    console.error('Error searching user account information:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controlador que me permite elimianr usuarios del sistema
export const deleteUserController = async (req, res) => {
  try {
    const userId = req.query.id
    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado.' })
    }
    const userAccount = await DeleteUserService(userId)
    res.status(200).json({ message: 'Usuario Eliminado exitosamente', user_account: userAccount })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al eliminar el usurio.' })
    }
    console.error('Error al actualizar la contraseña', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// ?Controller to call all over the countries
export const getallCountriesController = async(req, res) => {
  try {
    const countries = await getAllCountriesService()
    res.status(200).json({ countries })
  } catch (error) {
    console.error('Error al actualizar la contraseña', error)
    return res.status(500).json({ message: 'Internal server error.', error })
  }
}

// ?Controller to call all over the departments
export const getAllDepartmentController = async (req, res) => {
  try {
    const country = req.body.id_country
    const deparments = await getAllDepartmenService(country)
    res.status(200).json({ deparments })
  } catch (error) {
    console.error('Error al llamar los departamentos', error)
    return res.status(500).json({ message: 'Internal server error.', error })
  }
}

// ?Controller to call all over the departments
export const getAllCityController = async (req, res) => {
  try {
    const city = req.body.id_department
    const cities = await getAllCityService(city)
    res.status(200).json({ cities })
  } catch (error) {
    console.error('Error al llamar las ciudades', error)
    return res.status(500).json({ message: 'Internal server error.', error })
  }
}
