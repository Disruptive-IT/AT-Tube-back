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

const router = express.Router()

router.get('/allUsers', getAllUsersController)
router.get('/allClients', getAllClientsController)
router.post('/newuseradmin', createNewUserController)
router.delete('/deleteUser', deleteUserController)
router.get('/getCountries', getallCountriesController)
router.post('/getDepartments', getAllDepartmentController)
router.post('/getCities', getAllCityController)

export default router
