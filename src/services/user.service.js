import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const createNewUserService = async (data) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10) // ?hash de contrasena generica
    const user = await prisma.users.create({
      data: {
        documentType: { connect: { id_document_type: data.documentType } },
        document: data.document,
        name: data.name,
        country: { connect: { id_country: data.country } },
        department: { connect: { id_department: data.department } },
        city: { connect: { id_city: data.city } },
        address: data.address,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        role: { connect: { id_rol: 1 } }
      }
    })
    return user
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') { // !Este es el error cuando el registro no existe
      throw new Error('Duplicate Email')
    } else {
      console.error('Error al actualizar el usuario:', error)
      throw error
    }
  }
}

// *Servicio que me trae todos los users con el rol Admin
export const getAllUsersService = async () => {
  try {
    const users = await prisma.users.findMany({
      where: { id_rol: 1 },
      select: {
        id_users: true,
        avatar: true,
        documentType: { select: { name: true, id_document_type: true } },
        document: true,
        name: true,
        country: { select: { name: true, id_country: true, flag_code: true, phone_code: true } },
        id_department: true,
        str_Department: true,
        id_city: true,
        str_city: true,
        address: true,
        phone: true,
        email: true,
        id_rol: true,
        status: true
      }
    })
    const formattedUsers = users.map(user => ({
      id: user.id_users,
      avatar: user.avatar,
      idTipe: user.documentType.name,
      strIDTipe: user.documentType.id_document_type,
      document: user.document,
      name: user.name,
      country: user.country.name,
      id_country: user.country.id_country,
      id_department: user.id_department,
      department: user.str_Department,
      city: user.str_city,
      id_city: user.id_city,
      address: user.address,
      phone: user.phone,
      flag_code: user.flag_code,
      phone_code: user.phone_code,
      email: user.email,
      id_rol: user.id_rol,
      status: user.status,
      strStatus: !user.status ? 'Inactivo' : 'Activo'
    }))
    if (!users) {
      throw new Error('0 users found in the database.')
    }
    return formattedUsers
  } catch (error) {
    console.error('Error searching users information: ', error)
    throw error
  }
}

// *Servicio que me trae todos los users con el rol Client
export const getAllClientsService = async () => {
  try {
    const users = await prisma.users.findMany({
      where: { id_rol: 2 },
      select: {
        id_users: true,
        avatar: true,
        documentType: { select: { name: true, id_document_type: true } },
        document: true,
        name: true,
        country: { select: { name: true, id_country: true, flag_code: true, phone_code: true } },
        id_department: true,
        str_Department: true,
        id_city: true,
        str_city: true,
        address: true,
        phone: true,
        email: true,
        id_rol: true,
        status: true
      }
    })
    const formattedUsers = users.map(user => ({
      id: user.id_users,
      avatar: user.avatar,
      idTipe: user.documentType.name,
      strIDTipe: user.documentType.id_document_type,
      document: user.document,
      name: user.name,
      country: user.country.name,
      id_country: user.country.id_country,
      id_department: user.id_department,
      department: user.str_Department,
      city: user.str_city,
      id_city: user.id_city,
      address: user.address,
      phone: user.phone,
      flag_code: user.country.flag_code,
      phone_code: user.country.phone_code,
      email: user.email,
      id_rol: user.id_rol,
      status: user.status,
      strStatus: !user.status ? 'Inactivo' : 'Activo'
    }))
    if (!users) {
      throw new Error('0 users found in the database.')
    }
    return formattedUsers
  } catch (error) {
    console.error('Error searching users information: ', error)
    throw error
  }
}

// *servicio que me permite elimianr users del sistema
export const DeleteUserService = async (userId) => {
  try {
    const userDelete = await prisma.users.delete({ where: { id_users: userId } })
    if (!userDelete) { throw new Error('Usuario no encontrado.') }
    return userDelete
  } catch (error) {
    console.error('Error al eliminar el usuario: ', error)
    throw error
  }
}

// *Servicio para traer todos los paises
export const getAllCountriesService = async () => {
  try {
    const countries = await prisma.country.findMany()
    if (!countries) { throw new Error('No hay paises en la base de datos.') }
    return countries
  } catch (error) {
    console.error('Error al buscar paises:', error)
    throw error
  }
}

// *Servicio para traer todos los paises
export const getAllDepartmenService = async (req) => {
  const city = req
  
  if (!city) { throw new Error('No hay departamento seleccionado.') }
  try {
    const department = await prisma.department.findMany({ where: { id_country: city } })
    if (!department) { throw new Error('No hay departamentos en la base de datos.') }
    return department
  } catch (error) {
    console.error('Error al buscar paises:', error)
    throw error
  }
}

// *Servicio para traer todos los paises
export const getAllCityService = async (req) => {
  const department = req
  if (!department) { throw new Error('No hay departamento seleccionado.') }
  try {
    const cities = await prisma.city.findMany({ where: { id_department: department } })
    if (!cities) { throw new Error('No hay departamentos en la base de datos.') }
    return cities
  } catch (error) {
    console.error('Error al buscar paises:', error)
    throw error
  }
}