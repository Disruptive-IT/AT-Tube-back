/* eslint-disable camelcase */
import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient
const prisma = new PrismaClient()

// *Service to get all Purchases of especific user
export const getUserPurchasesService = async (idUser) => {
  if (!idUser) {
    throw new Error('Debe proporcionar un ID de usuario.')
  }
  try {
    const purchases = await prisma.sales.findMany({
      where: { id_user: idUser },
      select: {
        id_sales: true,
        total_price: true,
        finalize_at: true,
        canceled_at: true,
        canceled_reason: true,
        cotized_at: true,
        delivered_at: true,
        purchased_at: true,
        send_at: true,
        create_at: true,
        SalesStatus: {
          select: {
            id_status: true,
            name: true,
            description: true
          }
        },
        SalesTemplate: {
          select: {
            id_sales: true,
            id_template: true,
            box_amount: true,
            box_price: true,
            bottle_amount: true,
            bottle_price: true,
            decorator_type: true,
            decorator_price: true,
            template: {
              select: {
                id_template: true,
                design: true
              }
            }
          }
        }
      }
    })

    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id_sales,
      totalPrice: purchase.total_price,
      status: purchase.SalesStatus.id_status,
      strStatus: purchase.SalesStatus.name,
      finalizeAt: purchase.finalize_at,
      canceledAt: purchase.canceled_at,
      canceledReason: purchase.canceled_reason,
      cotizedAt: purchase.cotized_at,
      deliveredAt: purchase.delivered_at,
      purchasedAt: purchase.purchased_at,
      sendAt: purchase.send_at,
      createAt: purchase.create_at,
      // Mapeo de las plantillas
      salesTemplates: purchase.SalesTemplate.map(template => ({
        idSales: template.id_sales,
        idTemplate: template.id_template,
        boxAmount: template.box_amount,
        boxPrice: template.box_price,
        bottleAmount: template.bottle_amount,
        bottlePrice: template.bottle_price,
        decoratorType: template.decorator_type,
        decoratorPrice: template.decorator_price,
        desing: template.template.design
      }))
    }))

    return formattedPurchases
  } catch (error) {
    console.error('Error al obtener las compras con productos:', error)
    throw error
  }
}

// *Service to create Templates
export const createTemplatesService = async (req) => {
  const { id_users, design, decorator } = req
  try {
    const newTemplate = await prisma.templates.create({
      data: {
        id_users,
        design,
        decorator
      }
    })
    return newTemplate
  } catch (error) {
    console.error('Error al crear el diseno:', error)
    throw error
  }
}

/**
 * *Valida si un ID de usuario existe en la base de datos
 * @param {string} id_user - El ID del usuario a validar.
 * @returns {boolean} - Devuelve `true` si el usuario existe, de lo contrario `false`.
 */
const validateUserExists = async (id_user) => {
  const user = await prisma.users.findUnique({
    where: { id_users: id_user }
  })
  return user !== null
}

/**
 * Valida si el estado de la venta existe en la base de datos
 * @param {number} status - El ID del estado de la venta a validar.
 * @returns {boolean} - Devuelve `true` si el estado existe, de lo contrario `false`.
 */
const validateSalesStatusExists = async (status) => {
  const salesStatus = await prisma.salesStatus.findUnique({
    where: { id_status: status }
  })
  return salesStatus !== null
}

/**
 * Valida si el template existe en la base de datos
 * @param {string} id_template - El ID del template a validar.
 * @returns {boolean} - Devuelve `true` si el template existe, de lo contrario `false`.
 */
const validateTemplateExists = async (id_template) => {
  const template = await prisma.templates.findUnique({
    where: { id_template }
  })
  return template !== null
}

/**
 * Valida si el template pertenece al usuario
 * @param {string} id_user - El ID del usuario que está realizando la venta.
 * @param {string} id_template - El ID del template a verificar.
 * @returns {boolean} - Devuelve `true` si el template pertenece al usuario, de lo contrario `false`.
 */
const validateTemplateBelongsToUser = async (id_user, id_template) => {
  const template = await prisma.templates.findFirst({
    where: {
      id_template,
      id_users: id_user // Verifica si el template pertenece al usuario
    }
  })
  return template !== null
}

/**
 * Crea una venta (Sales) junto con los detalles de los templates (SalesTemplate).
 * @param {Object} salesData - Datos de la venta a crear.
 * @returns {Object} - Objeto con la venta creada.
 */
export const createPurchaseService = async (salesData) => {
  const {
    id_user,
    total_price,
    status,
    cotized_at,
    purchased_at,
    send_at,
    delivered_at,
    canceled_at,
    canceled_reason,
    salesTemplates
  } = salesData

  // Validar campos obligatorios
  if (!id_user || !total_price || !status || !salesTemplates || salesTemplates.length === 0) {
    throw new Error('Faltan campos obligatorios: id_user, total_price, status y salesTemplates son necesarios.')
  }

  // ?Validar que el usuario exista
  const userExists = await validateUserExists(id_user)
  if (!userExists) {
    throw new Error(`El usuario con id ${id_user} no existe.`)
  }

  // ?Validar que el estado de la venta exista
  const statusExists = await validateSalesStatusExists(status)
  if (!statusExists) {
    throw new Error(`El estado con id ${status} no existe.`)
  }

  // ?Validar que todos los templates existan y que pertenezcan al usuario
  for (const template of salesTemplates) {
    const templateExists = await validateTemplateExists(template.id_template)
    if (!templateExists) {
      throw new Error(`El template con id ${template.id_template} no existe.`)
    }

    const templateBelongsToUser = await validateTemplateBelongsToUser(id_user, template.id_template)
    if (!templateBelongsToUser) {
      throw new Error(`El template con id ${template.id_template} no pertenece al usuario con id ${id_user}.`)
    }
  }

  try {
    // Crear la venta en la base de datos
    const sale = await prisma.sales.create({
      data: {
        id_user,
        total_price,
        status,
        cotized_at,
        purchased_at,
        send_at,
        delivered_at,
        canceled_at,
        canceled_reason,
        SalesTemplate: {
          create: salesTemplates.map(template => ({
            id_template: template.id_template,
            box_amount: template.box_amount,
            box_price: template.box_price,
            bottle_amount: template.bottle_amount,
            bottle_price: template.bottle_price,
            decorator_type: template.decorator_type,
            decorator_price: template.decorator_price
          }))
        }
      }
    })

    return sale
  } catch (error) {
    console.error('Error creando la venta:', error)
    throw new Error('Error al crear la venta')
  }
}
