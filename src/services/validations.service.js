import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient
const prisma = new PrismaClient()
/* eslint-disable camelcase */

/**
 * *Valida si un ID de usuario existe en la base de datos
 * @param {string} id_user - El ID del usuario a validar.
 * @returns {boolean} - Devuelve `true` si el usuario existe, de lo contrario `false`.
 */
export const validateUserExistsService = async (data) => {
  const id_users = data
  const user = await prisma.users.findUnique({
    where: { id_users }
  })

  if (!user) {
    throw new Error('El usuario especificado no existe.')
  }
  return user
}

/**
 * *Valida si un ID de usuario existe en la base de datos
 * @param {string} id_user - El ID del usuario a validar.
 * @returns {boolean} - Devuelve `true` si el usuario existe, de lo contrario `false`.
 */
export const validateTemplateExistsService = async (data) => {
  const id_template = data
  const template = await prisma.templates.findUnique({
    where: { id_template }
  })

  if (!template) {
    throw new Error('El diseno especificado no existe.')
  }
  return template
}

/**
 * *Valida si el estado de la venta existe en la base de datos
 * @param {number} status - El ID del estado de la venta a validar.
 * @returns {boolean} - Devuelve `true` si el estado existe, de lo contrario `false`.
 */
export const validateSalesStatusExists = async (status) => {
  const salesStatus = await prisma.salesStatus.findUnique({
    where: { id_status: status }
  })
  if (!salesStatus) {
    const error = new Error(`El estado con id ${status} no existe.`)
    error.name = 'NotFoundError'
    throw error
  }
  return true
}

export async function validateTemplates (status, salesTemplates, total_price) {
  // ?Solo valida si el status es 1
  if (status === 1) {
    if (total_price != null && total_price !== '') {
      const error = new Error('Si el estado de la compra es cotización, el campo precio total debe estar vacío.')
      error.name = 'InvalidTotalPriceError'
      throw error
    }
    const templateData = await prisma.templates.findUnique({
      where: { id_template: salesTemplates[0].id_template },
      select: { decorator: true }
    })

    if (!templateData || templateData.decorator === null) {
      const error = new Error('Para poder generar una cotización el campo DECORADOR no puede venir nulo')
      error.name = 'MissingFieldsError'
      throw error
    }

    if (salesTemplates[0].decorator_price !== null) {
      const error = new Error('Para poder generar una cotización el campo PRECIO DEL DECORADOR no puede tener datos')
      error.name = 'MissingFieldsError'
      throw error
    }
  }
  return true
}

/**
 * *Valida si el template existe en la base de datos
 * @param {string} id_template - El ID del template a validar.
 * @returns {boolean} - Devuelve `true` si el template existe, de lo contrario `false`.
 */
export const validateTemplateExists = async (id_template) => {
  const template = await prisma.templates.findUnique({
    where: { id_template }
  })
  return template !== null
}

/**
 * *Valida si un ID de usuario existe en la base de datos
 * @param {string} id_user - El ID del usuario a validar.
 * @returns {boolean} - Devuelve `true` si el usuario existe, de lo contrario `false`.
 */
export const validateUserExists = async (id_user) => {
  const user = await prisma.users.findUnique({
    where: { id_users: id_user }
  })
  if (!user) {
    const error = new Error(`El usuario con id ${id_user} no existe.`)
    error.name = 'NotFoundError'
    throw error
  }
  return user !== null
}

export async function validateSaleExists (id_sales) {
  // Verifica si existe el registro en la base de datos
  if (!id_sales) {
    const customError = new Error('El ID de la venta es obligatorio')
    customError.name = 'InternalError'
    throw customError
  }
  const sale = await prisma.sales.findUnique({
    where: { id_sales },
    select: { id_sales: true } // Solo selecciona el campo necesario
  })

  if (!sale) {
    const customError = new Error(`La venta con el ID ${id_sales} no existe en la base de datos.`)
    customError.name = 'InternalError'
    throw customError
  }
  return true // Retorna true si el registro existe
}
