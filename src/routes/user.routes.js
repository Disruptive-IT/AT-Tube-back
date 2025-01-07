import express from 'express'
import {
  getAllUsersController,
  getAllClientsController,
  createNewUserController,
  deleteUserController,
  getallCountriesController,
  getAllDepartmentController,
  getAllCityController
} from '../controllers/user.controller.js'
import { authorizeAdmin } from '../middlewares/autorizeAdmin.js'

const router = express.Router()

router.get('/allUsers', authorizeAdmin, getAllUsersController)
router.get('/allClients', authorizeAdmin, getAllClientsController)
router.post('/newuseradmin', createNewUserController)
router.delete('/deleteUser', authorizeAdmin, deleteUserController)
router.get('/getCountries', getallCountriesController)
router.post('/getDepartments', getAllDepartmentController)
router.post('/getCities', getAllCityController)

export default router
