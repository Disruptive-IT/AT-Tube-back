/* eslint-disable camelcase */
import { changeStatusEmail, sendAdminPurchaseNotification } from './mails.service.js'
import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient
import { validateSaleExists, validateSalesStatusExists, validateTemplateExists, validateTemplateExistsService, validateTemplates, validateUserExists, validateUserExistsService } from './validations.service.js'
const prisma = new PrismaClient()

// *Service to get all Purchases of especific user
export const getUserPurchasesService = async (idUser, page = 1, pageSize = 10, searchTerm = '') => {
  if (!idUser) {
    throw new Error('Debe proporcionar un ID de usuario.')
  }

  try {
    // Verificar la existencia del usuario
    const user = await prisma.users.findUnique({
      where: { id_users: idUser }
    })

    if (!user) {
      const error = new Error(`El usuario con ID ${idUser} no existe.`)
      error.name = 'NotFoundError'
      throw error
    }

    // Cálculo del número de registros a omitir
    const skip = (page - 1) * pageSize

    // Verificar si searchTerm es un número
    const searchAsNumber = !isNaN(searchTerm) ? parseInt(searchTerm, 10) : null

    // Construir el filtro de búsqueda
    const filter = {
      AND: [
        { id_user: idUser }, // Asegurarse de que solo estamos buscando las compras del usuario actual
        searchTerm
          ? {
              OR: [
                { canceled_reason: { contains: searchTerm } },
                { SalesStatus: { name: { contains: searchTerm } } },
                { id_sales: { contains: searchTerm } }
              ]
            }
          : {}
      ]
    }

    // Obtener las compras con paginación y filtro
    const purchases = await prisma.sales.findMany({
      where: { id_user: idUser, ...filter },
      orderBy: { create_at: 'desc' },
      skip,
      take: pageSize,
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
        Reasoncanceled:true,
        SalesStatus: {
          select: {
            id_status: true,
            name: true
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
        usuario: {
          select: {
            id_users: true,
            avatar: true,
            document_type: true,
            document: true,
            name: true,
            str_Department: true,
            str_city: true,
            address: true,
            phone: true,
            email: true,
            id_rol: true,
            status: true,
            country: {
              select: {
                id_country: true,
                name: true,
                flag_code: true,
                phone_code: true
              }
            },
            role: {
              select: {
                id_rol: true,
                name: true
              }
            },
            documentType: {
              select: {
                id_document_type: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Calcular el número total de registros
    const totalPurchases = await prisma.sales.count({
      where: { id_user: idUser, ...filter }
    })

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalPurchases / pageSize)

    // Formatear las compras
    const formatDate = (date) => (date ? date.toISOString().split('T')[0] : null)

    const formattedPurchases = purchases.map((purchase) => ({
      avatar: purchase.usuario.avatar,
      name: purchase.usuario.name,
      phone: purchase.usuario.phone,
      email: purchase.usuario.email,
      document: purchase.usuario.document,
      idTipe: purchase.usuario.documentType.name,
      country: purchase.usuario.country.name,
      flag_code: purchase.usuario.country.flag_code,
      phone_code: purchase.usuario.phone_code,
      address: `${purchase.usuario.str_Department}-${purchase.usuario.str_city}-${purchase.usuario.address}`,
      id: purchase.id_sales,
      total_price: formatCurrency(purchase.total_price) || 'No se ha cotizado',
      ivaPrice: formatCurrency(purchase.total_price * 0.19),
      totalPlusIva: getPriceWithIva(purchase.total_price),
      status: purchase.SalesStatus.id_status,
      strStatus: purchase.SalesStatus.name,
      finalizeAt: formatDate(purchase.finalize_at),
      canceledAt: formatDate(purchase.canceled_at) || 'No se ha cancelado la compra',
      canceledReason: purchase.Reasoncanceled ? purchase.Reasoncanceled : 'Sin motivo de cancelación',
      ReasonCanceled: purchase.Reasoncanceled ? purchase.Reasoncanceled: { id_cancelreason: null, reason_text: 'No hay razón registrada' },
      cotizedAt: formatDate(purchase.cotized_at) || 'No se ha generado la cotización',
      deliveredAt: formatDate(purchase.delivered_at) || 'No se ha entregado el pedido',
      purchasedAt: formatDate(purchase.purchased_at) || 'No se ha realizado el pago',
      shippingAt: formatDate(purchase.send_at) || 'No se ha realizado el envío',
      createAt: formatDate(purchase.create_at),
      salesTemplates: purchase.SalesTemplate.map((template) => ({
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
        totalBoxesPricesWithoutFormat: template.box_price * template.box_amount
      }))
    }))

    // Devolver compras formateadas junto con metadatos
    return {
      data: formattedPurchases,
      meta: {
        total: totalPurchases,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error) {
    console.error('Error al obtener las compras con productos:', error)
    const customError = new Error('Error al obtener las compras con productos.')
    customError.name = 'InternalError'
    throw customError
  }
}

// *Service to create Templates
export const createTemplatesService = async (req) => {
  const { id_users, design, decorator, decorator_type, canva_decorator } = req
  // Validación de campos obligatorios
  if (!id_users) {
    throw new Error("El campo 'id_users' es obligatorio.")
  }
  if (!design) {
    throw new Error("El campo 'design' es obligatorio.")
  }
  try {
    await validateUserExistsService(id_users)
    // Crear la nueva plantilla
    const newTemplate = await prisma.templates.create({
      data: {
        id_users,
        design,
        decorator,
        decorator_type,
        canva_decorator
      }
    })
    return newTemplate
  } catch (error) {
    console.error('Error al crear el diseño:', error)
    throw error
  }
}

// *Service to create Templates
export const UpdateTemplatesService = async (req) => {
  const { id_template, design, decorator, decorator_type, canva_decorator } = req
  // Validación de campos obligatorios
  if (!design) {
    throw new Error("El campo 'design' es obligatorio.")
  }
  if (!id_template) {
    throw new Error("El campo 'design' es obligatorio.")
  }

  try {
    await validateTemplateExistsService(id_template)
    // Crear la nueva plantilla
    const updatedTemplate = await prisma.templates.update({
      where: {
        id_template // Asegúrate de tener el ID del template que deseas actualizar
      },
      data: {
        design,
        decorator,
        decorator_type,
        canva_decorator
      }
    })
    return updatedTemplate
  } catch (error) {
    console.error('Error al actualizar el diseño:', error)
    throw error
  }
}

export const getUserTemplatesService = async (id_users, page = 1, pageSize = 10) => {
  try {
    // Verificamos que el usuario existe
    const user = await prisma.users.findUnique({
      where: { id_users }
    })

    if (!user) {
      const error = new Error(`El usuario con id ${id_users} no existe.`)
      error.name = 'NotFoundError'
      throw error
    }

    // Calculamos el número de registros a omitir
    const skip = (page - 1) * pageSize

    // Obtenemos los templates con paginación y filtros por coincidencias
    const templates = await prisma.templates.findMany({
      where: { id_users },
      select: {
        id_template: true,
        id_users: true,
        design: true,
        decorator: true,
        decorator_type: true,
        canva_decorator: true,
        create_at: true,
        SalesTemplate: {
          take: 1, // Solo traer el último registro creado
          orderBy: { create_at: 'desc' }, // Ordenar por la fecha de creación en orden descendente
          select: {
            decorator_price: true
          }
        }
      },
      skip, // Saltar registros
      take: pageSize // Limitar registros por página
    })

    // Obtenemos el total de templates para calcular el número total de páginas
    const totalTemplates = await prisma.templates.count({
      where: { id_users }
    })

    const totalPages = Math.ceil(totalTemplates / pageSize)

    // Formateamos los datos para incluir el precio del decorador de manera clara
    const formattedTemplates = templates.map((template) => ({
      ...template,
      decorator_price: template.SalesTemplate?.[0]?.decorator_price || null // Si existe el precio, lo incluimos
    }))

    return {
      data: formattedTemplates,
      meta: {
        total: totalTemplates,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error) {
    console.error('Error al traer los diseños del usuario', error)
    const customError = new Error('Error al traer los diseños del usuario')
    customError.name = 'InternalError'
    throw customError
  }
}

/**
 * *Valida si el template pertenece al usuario
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
 * ?Crea una venta (Sales) junto con los detalles de los templates (SalesTemplate).
 * @param {Object} salesData - Datos de la venta a crear.
 * @returns {Object} - Objeto con la venta creada.
 */
export const createPurchaseService = async (salesData) => {
  const { id_user, status, salesTemplates } = salesData

  const purchased_at = null
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
  await validateUserExists(id_user) // ?Validar que el usuario exista

  for (const template of salesTemplates) {
    const templateExists = await validateTemplateExists(template.id_template)
    if (!templateExists) {
      const error = new Error(`El template con id ${template.id_template} no existe.`)
      error.name = 'NotFoundError'
      throw error
    }

    // await validateTemplateBelongsToUser(id_user, template.id_template)
    const templateBelongsToUser = await validateTemplateBelongsToUser(id_user, template.id_template)
    if (!templateBelongsToUser) {
      const error = new Error(`El template con id ${template.id_template} no pertenece al usuario con id ${id_user}.`)
      error.name = 'ForbiddenError'
      throw error
    }
  }

  await validateTemplates(status, salesTemplates, total_price) // ? validate Templates when status in 1 "Cotizacion"

  if (status >= 3) {
    const error = new Error('el estado de la compra no puede ser produccion, enviado, entregado o cancelado')
    error.name = 'ForbiddenError'
    throw error
  }

  // Validar que si el estado es 1, total_price debe ser null o vacío
  if (status === 2) {
    total_price = ((salesTemplates[0].box_price * salesTemplates[0].box_amount) + salesTemplates[0].decorator_price)
    // purchased_at = new Date()
  }
  console.log(total_price)
  await validateSalesStatusExists(status) // ?validate if status exists in database

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
    const customError = new Error('Error al crear la venta', error)
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
export const getAllPurchasesService = async (year, page = 1, pageSize = 10, searchTerm = '') => {
  try {
    // Cálculo del número de registros a omitir
    const skip = (page - 1) * pageSize

    // Construir la cláusula `where` con filtro por coincidencias
    const whereClause = {

      OR: [
        { id_sales: { contains: searchTerm } },
        { usuario: { name: { contains: searchTerm } } },
        { usuario: { document: { contains: searchTerm } } },
        { usuario: { str_Department: { contains: searchTerm } } },
        { usuario: { str_city: { contains: searchTerm } } },
        { usuario: { str_country: { contains: searchTerm } } },
        { usuario: { phone: { contains: searchTerm } } },
        { usuario: { email: { contains: searchTerm } } },
        { usuario: { documentType: { name: { contains: searchTerm } } } },
        { SalesStatus: { name: { contains: searchTerm } } }
      ]
    }

    // Obtener las compras con paginación
    const purchases = await prisma.sales.findMany({
      where: whereClause,
      orderBy: {
        create_at: 'desc'
      },
      skip, // Saltar registros
      take: pageSize, // Limitar registros por página
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
          }
        },
        Reasoncanceled:true,
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
        usuario: {
          select: {
            id_users: true,
            avatar: true,
            document_type: true,
            document: true,
            name: true,
            str_Department: true,
            str_city: true,
            address: true,
            phone: true,
            email: true,
            id_rol: true,
            status: true,
            country: {
              select: {
                id_country: true,
                name: true,
                flag_code: true,
                phone_code: true
              }
            },
            role: {
              select: {
                id_rol: true,
                name: true
              }
            },
            documentType: {
              select: {
                id_document_type: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Calcular el número total de registros
    const totalPurchases = await prisma.sales.count({ where: whereClause })

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalPurchases / pageSize)

    // Formatear las compras
    const formatDate = (date) => (date ? date.toISOString().split('T')[0] : null)

    const formattedPurchases = purchases.map((purchase) => ({
      canceledReason: purchase.Reasoncanceled ? purchase.Reasoncanceled : 'Sin motivo de cancelación',
      avatar: purchase.usuario.avatar,
      name: purchase.usuario.name,
      phone: purchase.usuario.phone,
      email: purchase.usuario.email,
      document: purchase.usuario.document,
      idTipe: purchase.usuario.documentType.name,
      country: purchase.usuario.country.name,
      flag_code: purchase.usuario.country.flag_code,
      phone_code: purchase.usuario.country.phone_code,
      address: `${purchase.usuario.str_Department}-${purchase.usuario.str_city}-${purchase.usuario.address}`,
      id: purchase.id_sales,
      total_price: formatCurrency(purchase.total_price) || 'No se ha cotizado',
      ivaPrice: formatCurrency(purchase.total_price * 0.19),
      totalPlusIva: getPriceWithIva(purchase.total_price),
      status: purchase.SalesStatus.id_status,
      strStatus: purchase.SalesStatus.name,
      finalizeAt: formatDate(purchase.finalize_at),
      canceledAt: formatDate(purchase.canceled_at) || 'No se ha cancelado la compra',
      cotizedAt: formatDate(purchase.cotized_at) || 'No se ha generado la cotización',
      deliveredAt: formatDate(purchase.delivered_at) || 'No se ha entregado el pedido',
      purchasedAt: formatDate(purchase.purchased_at) || 'No se ha realizado el pago',
      shippingAt: formatDate(purchase.send_at) || 'No se ha realizado el envío',
      createAt: formatDate(purchase.create_at),
      salesTemplates: purchase.SalesTemplate.map((template) => ({
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
        totalBoxesPricesWithoutFormat: template.box_price * template.box_amount
      }))
    }))

    // Devolver compras formateadas junto con metadatos
    return {
      data: formattedPurchases,
      meta: {
        total: totalPurchases,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error) {
    console.error('Error al obtener las compras con productos:', error)
    const customError = new Error('Error al obtener las compras con productos.')
    customError.name = 'InternalError'
    throw customError
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
  const { id_sales, total_price, decorator_price, email } = data
  try {
    await validateSaleExists(id_sales)
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

    await changeStatusEmail(id_sales, 2) // Cambiar 2 al estado correspondiente

    return updatedSale
  } catch (error) {
    console.error('Error al cotizar la etiqueta de la compra', error)
    const customError = new Error('Error al cotizar la venta')
    customError.name = 'InternalError'
    throw customError
  }
}

export const updatePurchaseToShippedService = async (data) => {
  const { id_sales, email, oldStatus } = data
  await validateSaleExists(id_sales)
  if (oldStatus > 4) {
    const customError = new Error('Si la venta fue entregada o cancelada, su estado no puede volver a ser enviado.')
    customError.name = 'InternalError'
    throw customError
  }
  if (oldStatus <=2) {
    const customError = new Error('La venta no puede ser enviada sin antes pasar por producción ')
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

    await changeStatusEmail(id_sales, 4)

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
  await validateSaleExists(id_sales)
  if (oldStatus > 5) {
    const customError = new Error('Si la venta fue cancelada, su estado no puede volver a ser enviado.')
    customError.name = 'InternalError'
    throw customError
  }
  if (oldStatus <=3) {
    const customError = new Error('La venta no puede cambiar a entregado sin antes pasar por los demasmm.')
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

    await changeStatusEmail(id_sales, 5)

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
  console.log(canceled_reason)
  await validateSaleExists(id_sales)
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
    // console.log(email)

    // await changeStatusEmail(id_sales, 6)

    return updatedSale
  } catch (error) {
    console.error('Error al cancelar la compra', error)
    const customError = new Error('Error al cancelar la compra', error)
    customError.name = 'InternalError'
    throw customError
  }
}

export const updatePurchaseToProductionService = async (description, id_orden_pago, id_pago_realizado, date_approve, status, checkoutType) => {
  try {
    const updatedSale = await prisma.sales.update({
      where: { id_sales: description },
      data: {
        id_orden_pago,
        id_pago_realizado,
        date_approve,
        status: 3,
        status_approve: status,
        purchased_at: new Date(),
        checkoutType
      }
    })
    await changeStatusEmail(description, 3)
    return updatedSale
  } catch (error) {
    console.error('Error al cancelar la compra', error)
    const customError = new Error('Error al cancelar la compra', error)
    customError.name = 'InternalError'
    throw customError
  }
}

export const ValidateSalesExistService = async (id_sales) => {
  try {
    const sale = await prisma.sales.findUnique({
      where: {
        id_sales
      },
      select: {
        id_sales: true
      }
    })
    if (!sale) {
      const customError = new Error('La venta no existe')
      customError.name = 'NotFoundError'
      throw customError
    } else {
      return true
    }
  } catch (error) {
    console.error('Error al buscar la compra', error)
    const customError = new Error('La compra no existe', error)
    customError.name = 'InternalError'
    throw customError
  }
}


export const getAllCancelReasonService = async () => {
  try{
    const reasons = await prisma.cancelReason.findMany();

    if (!reasons.length) {
      throw new Error('No se encontraron motivos de cancelación');
    }
    return reasons;
  }
  catch(error){
    console.error('Error al obtener los motivos de cancelación', error);
    throw error;
  }
}