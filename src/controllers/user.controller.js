import {
  getUserAccountService,
  getAllUsersService,
  getAllClientsService
} from '../services/user.service.js'

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

// ?Controlador para traer todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const systemUsers = await getAllUsersService()

    res.status(200).json({ systemUsers })
  } catch (error) {
    console.error('Error searching user account information:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

export const getAllClients = async (req, res) => {
  try {
    const systemUsers = await getAllClientsService()

    res.status(200).json({ systemUsers })
  } catch (error) {
    console.error('Error searching user account information:', error)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

// export const personalUpdateUser = async (req, res) => {
//   try {
//       const { user_id } = req.params
//       const userInformation = req.body
//       const updatedUser = await personalUpdateUserService(parseInt(user_id), userInformation)

//       if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

//       res.status(200).json({ updatedUser });

//   } catch (error) {
//       console.error('Error al obtener al usuario para modificar: ', error)
//       res.status(500).json({ message: 'Error interno del servidor.', error })
//   }
// }

// export const adminUpdateUser = async (req, res) => {
//   try {
//       const { user_id } = req.params
//       const userInformation = req.body
//       const updatedUser = await adminUpdateUserService(parseInt(user_id), userInformation)

//       if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

//       res.status(200).json({ updatedUser });

//   } catch (error) {
//       console.error('Error al obtener al usuario para modificar: ', error)
//       res.status(500).json({ message: 'Error interno del servidor.', error })
//   }
// }

// export const playerUpdateState = async (req, res) => {
//   try {
//       const { user_id } = req.params
//       const userInformation = req.body
//       const updatedUser = await playerUpdateStateService(parseInt(user_id), userInformation)

//       if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

//       res.status(200).json({ updatedUser });

//   } catch (error) {
//       console.error('Error al obtener al usuario para modificar: ', error)
//       res.status(500).json({ message: 'Error interno del servidor.', error })
//   }
// }

// //Nuevo controller
// export const getAllUserStates = async (req, res) => {
//   try {
//       const userStates = await getAllUserStatesService();
//       res.status(200).json({ userStates });
//   } catch (error) {
//       console.error('Error fetching user states:', error);
//       res.status(500).json({ message: 'Internal server error.' });
//   }
// };
