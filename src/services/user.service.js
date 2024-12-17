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
export const getAllUsersService = async (page = 1, limit = 10, searchTerm = '') => {
  try {
    const offset = (page - 1) * limit

    // Construir la cláusula de búsqueda con coincidencias
    const whereClause = {
      id_rol: 1, // Filtra solo usuarios con rol 1
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } }, // Coincidencias en nombre
          { document: { contains: searchTerm, mode: 'insensitive' } }, // Coincidencias en documento
          { email: { contains: searchTerm, mode: 'insensitive' } }, // Coincidencias en email
          { phone: { contains: searchTerm, mode: 'insensitive' } } // Coincidencias en teléfono
        ]
      })
    }

    // Realizar las consultas simultáneamente
    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
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
      }),
      prisma.users.count({ where: whereClause }) // Total de usuarios que cumplen el filtro
    ])

    // Formatear usuarios
    const formattedUsers = users.map(user => ({
      id: user.id_users,
      avatar: user.avatar,
      idTipe: user.documentType?.name,
      strIDTipe: user.documentType?.id_document_type,
      document: user.document,
      name: user.name,
      country: user.country?.name,
      id_country: user.country?.id_country,
      id_department: user.id_department,
      department: user.str_Department,
      city: user.str_city,
      id_city: user.id_city,
      address: user.address,
      phone: user.phone,
      flag_code: user.country?.flag_code,
      phone_code: user.country?.phone_code,
      email: user.email,
      id_rol: user.id_rol,
      status: user.status,
      strStatus: !user.status ? 'Inactivo' : 'Activo'
    }))

    return {
      users: formattedUsers,
      total: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit)
    }
  } catch (error) {
    console.error('Error fetching users with searchTerm: ', error)
    throw error
  }
}

// *Servicio que me trae todos los users con el rol Client
export const getAllClientsService = async (page = 1, limit = 10, searchTerm = '') => {
  try {
    const offset = (page - 1) * limit

    // Construir la cláusula de búsqueda con coincidencias
    const whereClause = {
      id_rol: 2, // Filtra solo clientes con rol 2
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } }, // Coincidencias en nombre
          { document: { contains: searchTerm, mode: 'insensitive' } }, // Coincidencias en documento
          { email: { contains: searchTerm, mode: 'insensitive' } }, // Coincidencias en email
          { phone: { contains: searchTerm, mode: 'insensitive' } } // Coincidencias en teléfono
        ]
      })
    }

    const [clients, totalClients] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
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
      }),
      prisma.users.count({ where: whereClause }) // Total de clientes que cumplen el filtro
    ])

    // Formatear clientes
    const formattedClients = clients.map(client => ({
      id: client.id_users,
      avatar: client.avatar,
      idTipe: client.documentType?.name,
      strIDTipe: client.documentType?.id_document_type,
      document: client.document,
      name: client.name,
      country: client.country?.name,
      id_country: client.country?.id_country,
      id_department: client.id_department,
      department: client.str_Department,
      city: client.str_city,
      id_city: client.id_city,
      address: client.address,
      phone: client.phone,
      flag_code: client.country?.flag_code,
      phone_code: client.country?.phone_code,
      email: client.email,
      id_rol: client.id_rol,
      status: client.status,
      strStatus: !client.status ? 'Inactivo' : 'Activo'
    }))

    return {
      clients: formattedClients,
      total: totalClients,
      currentPage: page,
      totalPages: Math.ceil(totalClients / limit)
    }
  } catch (error) {
    console.error('Error searching clients information: ', error)
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
