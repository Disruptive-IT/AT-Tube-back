/* eslint-disable camelcase */
import { changeStatusEmail, sendAdminPurchaseNotification } from './mails.service.js'
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
      orderBy: {
        create_at: 'desc'
      },
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
            name: true
            // description: true
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
                decorator: true,
                design: true
              }
            }
          }
        },
        usuario: { // Relación con Users
          select: {
            id_users: true,
            avatar: true,
            document_type: true,
            document: true,
            name: true,
            id_country: true,
            id_department: true,
            id_city: true,
            address: true,
            phone: true,
            email: true,
            id_rol: true,
            status: true,
            create_at: true,
            update_at: true,
            country: {
              select: {
                id_country: true,
                name: true // Puedes agregar más campos de Country si los necesitas
              }
            },
            department: {
              select: {
                id_department: true,
                name: true // Puedes agregar más campos de Department si los necesitas
              }
            },
            city: {
              select: {
                id_city: true,
                name: true // Puedes agregar más campos de City si los necesitas
              }
            },
            role: {
              select: {
                id_rol: true,
                name: true // Puedes agregar más campos de Role si los necesitas
              }
            },
            documentType: {
              select: {
                id_document_type: true,
                name: true // Puedes agregar más campos de DocumentType si los necesitas
              }
            }
          }
        }
      }
    })
    const formatDate = (date) => date ? date.toISOString().split('T')[0] : null

    const formattedPurchases = purchases.map(purchase => ({
      avatar: purchase.usuario.avatar,
      name: purchase.usuario.name,
      phone: purchase.usuario.phone,
      email: purchase.usuario.email,
      document: purchase.usuario.document,
      idTipe: purchase.usuario.documentType.name,
      country: purchase.usuario.country.name,
      address: (purchase.usuario.department.name + '-' + purchase.usuario.city.name + '-' + purchase.usuario.address),
      id: purchase.id_sales,
      total_price: formatCurrency(purchase.total_price) || 'No se ha cotizado',
      ivaPrice: formatCurrency((purchase.total_price * 0.19)),
      totalPlusIva: getPriceWithIva(purchase.total_price),
      status: purchase.SalesStatus.id_status,
      strStatus: purchase.SalesStatus.name,
      finalizeAt: formatDate(purchase.finalize_at),
      canceledAt: formatDate(purchase.canceled_at) || 'No se ha cancelado la compra',
      canceledReason: purchase.canceled_reason,
      cotizedAt: formatDate(purchase.cotized_at) || 'No se ha generado la cotización',
      deliveredAt: formatDate(purchase.delivered_at) || 'No se ha entregado el pedido',
      purchasedAt: formatDate(purchase.purchased_at) || 'No se ha realizado el pago',
      shippingAt: formatDate(purchase.send_at) || 'No se ha realizado el envío',
      createAt: formatDate(purchase.create_at),
      // Mapeo de las plantillas
      salesTemplates: purchase.SalesTemplate.map(template => ({
        idSales: template.id_sales,
        idTemplate: template.id_template,
        boxAmount: template.box_amount,
        boxPrice: formatCurrency(template.box_price),
        bottleAmount: template.bottle_amount,
        bottlePrice: formatCurrency(template.bottle_price),
        decorator: template.template.decorator,
        decoratorType: template.decorator_type,
        decoratorPrice: formatCurrency(template.decorator_price),
        design: template.template.design,
        totalBoxPrices: formatCurrency(template.box_price * template.box_amount),
        totalBoxesPricesWithoutFormat: (template.box_price * template.box_amount)
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

  // Validación de campos obligatorios
  if (!id_users) {
    throw new Error("El campo 'id_users' es obligatorio.")
  }
  if (!design) {
    throw new Error("El campo 'design' es obligatorio.")
  }

  try {
    // Validar que el usuario exista
    const existingUser = await prisma.users.findUnique({
      where: { id_users }
    })
    if (!existingUser) {
      throw new Error('El usuario especificado no existe.')
    }

    // Crear la nueva plantilla
    const newTemplate = await prisma.templates.create({
      data: {
        id_users,
        design,
        decorator
      }
    })
    return newTemplate
  } catch (error) {
    console.error('Error al crear el diseño:', error)
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

async function validateTemplates (status, salesTemplates) {
  // ?Solo valida si el status es 1
  if (status === 1) {
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
      const error = new Error('Para poder generar una cotización el campo PRECIO DEL DECORADOR no puede con datos')
      error.name = 'MissingFieldsError'
      throw error
    }
  }
  return true
}

export async function generateUniqueCode () {
  // Buscar la última venta registrada
  const lastSale = await prisma.sales.findFirst({
    orderBy: {
      id_sales: 'desc' // Ordenar por el ID más reciente
    }
  })

  // Obtener el nuevo número consecutivo
  const newId = lastSale ? lastSale.id + 1 : 1

  // Formatear el código único (por ejemplo, 'SALE-2024-0001')
  const year = new Date().getFullYear()
  const formattedId = `SALE-${year}-${newId.toString().padStart(4, '0')}`

  return formattedId
}

/**
 * ?Crea una venta (Sales) junto con los detalles de los templates (SalesTemplate).
 * @param {Object} salesData - Datos de la venta a crear.
 * @returns {Object} - Objeto con la venta creada.
 */
export const createPurchaseService = async (salesData) => {
  // !Vaidaciones pendientes: que el usuario sea cliente,
  // !que no si el estado no es para produccion no haya fecha de pagado

  const {
    id_user,
    status,
    salesTemplates
  } = salesData

  let purchased_at = null
  let total_price = null
  // Lista de campos obligatorios para validar
  const requiredFields = [
    { field: 'id_user', value: id_user },
    { field: 'status', value: status },
    { field: 'salesTemplates', value: salesTemplates }
  ]

  // Verificar si algún campo requerido está ausente o inválido
  for (const { field, value } of requiredFields) {
    if (!value || (field === 'salesTemplates' && (!Array.isArray(value) || value.length === 0))) {
      const error = new Error(`Faltan campos obligatorios: ${field} es necesario.`)
      error.name = 'MissingFieldsError'
      throw error
    }
  }

  // Validar que si el estado es 1, total_price debe ser null o vacío
  if (status === 1 && total_price != null && total_price !== '') {
    const error = new Error('Si el estado de la compra es cotización, el campo precio total debe estar vacío.')
    error.name = 'InvalidTotalPriceError'
    throw error
  }

  await validateTemplates(status, salesTemplates)

  if (status === 2 || status === 4 || status === 5 || status === 6) {
    const error = new Error('el estado de la compra no puede ser para pagar, enviado, entregado o cancelado')
    error.name = 'ForbiddenError'
    throw error
  }

  // Validar que si el estado es 1, total_price debe ser null o vacío
  if (status === 3) {
    total_price = ((salesTemplates[0].box_price * salesTemplates[0].box_amount) + salesTemplates[0].decorator_price)
  }

  // Validar que el usuario exista
  const userExists = await validateUserExists(id_user)
  if (!userExists) {
    const error = new Error(`El usuario con id ${id_user} no existe.`)
    error.name = 'NotFoundError'
    throw error
  }

  if (status === 3) {
    purchased_at = new Date()
  }

  // Validar que el estado de la venta exista
  const statusExists = await validateSalesStatusExists(status)
  if (!statusExists) {
    const error = new Error(`El estado con id ${status} no existe.`)
    error.name = 'NotFoundError'
    throw error
  }

  // Validar que todos los templates existan y que pertenezcan al usuario
  for (const template of salesTemplates) {
    const templateExists = await validateTemplateExists(template.id_template)
    if (!templateExists) {
      const error = new Error(`El template con id ${template.id_template} no existe.`)
      error.name = 'NotFoundError'
      throw error
    }

    const templateBelongsToUser = await validateTemplateBelongsToUser(id_user, template.id_template)
    if (!templateBelongsToUser) {
      const error = new Error(`El template con id ${template.id_template} no pertenece al usuario con id ${id_user}.`)
      error.name = 'ForbiddenError'
      throw error
    }
  }

  // const id_sales = await generateUniqueCode()
  try {
    // Crear la venta en la base de datos
    const sale = await prisma.sales.create({
      data: {
        id_user,
        total_price,
        status,
        purchased_at,
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
    await sendAdminPurchaseNotification({
      id: sale.id_sales,
      date: sale.purchased_at || 'Fecha no disponible',
      total: sale.total_price || 0
    })

    return sale
  } catch (error) {
    console.error('Error creando la venta:', error)
    const customError = new Error('Error al crear la venta')
    customError.name = 'InternalError'
    throw customError
  }
}

// Función para formatear como moneda (puedes reutilizarla siempre que lo necesites)
const formatCurrency = (value) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
  }
  return value
}

const getPriceWithIva = (price) => {
  const ivaAmount = price * 0.19
  const totalPlusIva = price + ivaAmount
  return formatCurrency(totalPlusIva)
}

// ?controller to get all Purchases, firts: data getted since 5months ago, if props are not null the periode will be change
export const getAllPurchasesService = async (year) => {
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date((year || currentYear), 0, 1) // ?1 de enero
  const endOfYear = new Date((year || currentYear), 11, 31, 23, 59, 59) // ?31 de diciembre

  try {
    const purchases = await prisma.sales.findMany({
      where: {
        create_at: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      orderBy: {
        create_at: 'desc'
      },
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
            name: true
            // description: true
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
                decorator: true,
                design: true
              }
            }
          }
        },
        usuario: { // Relación con Users
          select: {
            id_users: true,
            avatar: true,
            document_type: true,
            document: true,
            name: true,
            id_country: true,
            id_department: true,
            id_city: true,
            address: true,
            phone: true,
            email: true,
            id_rol: true,
            status: true,
            create_at: true,
            update_at: true,
            country: {
              select: {
                id_country: true,
                name: true // Puedes agregar más campos de Country si los necesitas
              }
            },
            department: {
              select: {
                id_department: true,
                name: true // Puedes agregar más campos de Department si los necesitas
              }
            },
            city: {
              select: {
                id_city: true,
                name: true // Puedes agregar más campos de City si los necesitas
              }
            },
            role: {
              select: {
                id_rol: true,
                name: true // Puedes agregar más campos de Role si los necesitas
              }
            },
            documentType: {
              select: {
                id_document_type: true,
                name: true // Puedes agregar más campos de DocumentType si los necesitas
              }
            }
          }
        }
      }
    })
    const formatDate = (date) => date ? date.toISOString().split('T')[0] : null

    const formattedPurchases = purchases.map(purchase => ({
      avatar: purchase.usuario.avatar,
      name: purchase.usuario.name,
      phone: purchase.usuario.phone,
      email: purchase.usuario.email,
      document: purchase.usuario.document,
      idTipe: purchase.usuario.documentType.name,
      country: purchase.usuario.country.name,
      address: (purchase.usuario.department.name + '-' + purchase.usuario.city.name + '-' + purchase.usuario.address),
      id: purchase.id_sales,
      total_price: formatCurrency(purchase.total_price) || 'No se ha cotizado',
      ivaPrice: formatCurrency((purchase.total_price * 0.19)),
      totalPlusIva: getPriceWithIva(purchase.total_price),
      status: purchase.SalesStatus.id_status,
      strStatus: purchase.SalesStatus.name,
      finalizeAt: formatDate(purchase.finalize_at),
      canceledAt: formatDate(purchase.canceled_at) || 'No se ha cancelado la compra',
      canceledReason: purchase.canceled_reason,
      cotizedAt: formatDate(purchase.cotized_at) || 'No se ha generado la cotización',
      deliveredAt: formatDate(purchase.delivered_at) || 'No se ha entregado el pedido',
      purchasedAt: formatDate(purchase.purchased_at) || 'No se ha realizado el pago',
      shippingAt: formatDate(purchase.send_at) || 'No se ha realizado el envío',
      createAt: formatDate(purchase.create_at),
      // Mapeo de las plantillas
      salesTemplates: purchase.SalesTemplate.map(template => ({
        idSales: template.id_sales,
        idTemplate: template.id_template,
        boxAmount: template.box_amount,
        boxPrice: formatCurrency(template.box_price),
        bottleAmount: template.bottle_amount,
        bottlePrice: formatCurrency(template.bottle_price),
        decorator: template.template.decorator,
        decoratorType: template.decorator_type,
        decoratorPrice: formatCurrency(template.decorator_price),
        design: template.template.design,
        totalBoxPrices: formatCurrency(template.box_price * template.box_amount),
        totalBoxesPricesWithoutFormat: (template.box_price * template.box_amount)
      }))
    }))

    return formattedPurchases
  } catch (error) {
    console.error('Error al obtener las compras con productos:', error)
    throw error
  }
}

export const getYearsPurchasesService = async () => {
  try {
    const yearsWithSales = await prisma.sales.findMany({
      select: {
        create_at: true
      },
      orderBy: {
        create_at: 'desc'
      }
    })

    // Extrae los años de las fechas y elimina duplicados
    const years = Array.from(new Set(yearsWithSales.map(sale => sale.create_at.getFullYear())))

    return years
  } catch (error) {
    console.error('Error al obtener las compras con productos:', error)
    throw error
  }
}

/**
 * ?Crea una venta (Sales) junto con los detalles de los templates (SalesTemplate).
 * @param {Object} salesData - Datos de la venta a crear.
 * @returns {Object} - Objeto con la venta creada.
 */
export const updatePurchaseToPayService = async (data) => {
  // ?el problema viene de aqui al momento de actualizar el precio total
  const { id_sales, total_price, decorator_price, email } = data
  try {
    const updatedSale = await prisma.sales.update({
      where: { id_sales },
      data: {
        total_price: (total_price + decorator_price),
        status: 2,
        cotized_at: new Date(),
        SalesTemplate: {
          updateMany: {
            where: { id_sales },
            data: {
              decorator_price
            }
          }
        }
      }
    })
    console.log(email)

    return updatedSale
  } catch (error) {
    console.error('Error al cotizar la etiqueta de la compra', error)
    const customError = new Error('Error al cotizar la venta')
    customError.name = 'InternalError'
    throw customError
  }
}
async function validateSaleExists (id_sales) {
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
export const updatePurchaseToShippedService = async (data) => {
  const { id_sales, email, oldStatus } = data
  validateSaleExists(id_sales)
  if (oldStatus > 4) {
    const customError = new Error('Si la venta fue entregada o cancelada, su estado no puede volver a ser enviado.')
    customError.name = 'InternalError'
    throw customError
  }
  try {
    const updatedSale = await prisma.sales.update({
      where: { id_sales },
      data: {
        status: 4,
        send_at: new Date()
      }
    })
    console.log(email)
    return updatedSale
  } catch (error) {
    console.error('Error al caambiar el estado de a venta a enviado', error)
    const customError = new Error('Error al caambiar el estado de a venta a enviado', error)
    customError.name = 'InternalError'
    throw customError
  }
}

export const updatePurchaseToDeliveredService = async (data) => {
  const { id_sales, email, oldStatus } = data
  validateSaleExists(id_sales)
  if (oldStatus > 5) {
    const customError = new Error('Si la venta fue cancelada, su estado no puede volver a ser enviado.')
    customError.name = 'InternalError'
    throw customError
  }

  try {
    const updatedSale = await prisma.sales.update({
      where: { id_sales },
      data: {
        status: 5,
        delivered_at: new Date()
      }
    })
    console.log(email)
    return updatedSale
  } catch (error) {
    console.error('Error al caambiar el estado de a venta a entregado', error)
    const customError = new Error('Error al cambiar el estado de a venta a entregado')
    customError.name = 'InternalError'
    throw customError
  }
}

// ?Cancel Purchase
export const updatePurchaseToCancelService = async (data) => {
  const { id_sales, canceled_reason, email } = data
  validateSaleExists(id_sales)
  if (canceled_reason === '' || canceled_reason === null) {
    const customError = new Error('La causa de la cancelación es obligatoria')
    customError.name = 'InternalError'
    throw customError
  }
  try {
    const updatedSale = await prisma.sales.update({
      where: { id_sales },
      data: {
        status: 6,
        canceled_at: new Date(),
        canceled_reason
      }
    })
    console.log(email)
    return updatedSale
  } catch (error) {
    console.error('Error al cancelar la compra', error)
    const customError = new Error('Error al cancelar la compra', error)
    customError.name = 'InternalError'
    throw customError
  }
}
