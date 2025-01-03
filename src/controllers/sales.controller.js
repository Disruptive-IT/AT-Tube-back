import {
  createPurchaseService,
  createTemplatesService,
  getAllPurchasesService,
  getUserPurchasesService,
  getUserTemplatesService,
  getYearsPurchasesService,
  updatePurchaseToCancelService,
  updatePurchaseToDeliveredService,
  updatePurchaseToPayService,
  updatePurchaseToProductionService,
  updatePurchaseToShippedService,
  UpdateTemplatesService
} from '../services/sales.service.js'
import { notifyPendingDesignService } from '../services/mails.service.js'
import { ValidateSignaturePayment } from '../lib/paymentsValidations.js'

// ?Controller to get all purchases orders for a especific user
export const getUserPurchasesController = async (req, res) => {
  const { id, page, pageSize, searchTerm } = req.body
  try {
    const userPurchases = await getUserPurchasesService(id, page, pageSize, searchTerm)
    res.status(200).json({ message: 'Compras Traidas con exito', purchases: userPurchases })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar la contraseña.' })
    }
    console.error('can`t get purchases', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

export const getAllPurchasesController = async (req, res) => {
  const { year, page, pageSize, searchTerm } = req.body
  try {
    const Purchases = await getAllPurchasesService(parseInt(year), page, pageSize, searchTerm)
    res.status(200).json({ message: 'Compras Traidas con exito', purchases: Purchases })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar la contraseña.' })
    }
    console.error('can`t get purchases', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

export const getYearsPurchasesController = async (req, res) => {
  try {
    const years = await getYearsPurchasesService()
    res.status(200).json({ years })
  } catch (error) {
    if (error.message === 'ID proporcionado no existe.') {
      return res.status(404).json({ message: 'Usuario no encontrado, Error al actualizar la contraseña.' })
    }
    console.error('can`t get purchases', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

// ?Controller to create a new template
export const createTemplateController = async (req, res) => {
  try {
    const template = await createTemplatesService(req.body)
    res.status(200).json({ message: 'Diseño creado exitosamente', template })
  } catch (error) {
    console.error('No se pudo crear el diseño', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

// ?Controller to get all Templates from especific user
export const getUserTemplateController = async (req, res) => {
  const idUsers = req.query.id_users
  const page = req.query.page

  if (!idUsers) {
    return res.status(400).json({ error: 'Debe proporcionar un id de usuario' }) // Manejo si el id no se proporciona
  }

  try {
    const templates = await getUserTemplatesService(idUsers, page) // Llamada al servicio con el id_users
    res.status(200).json({ message: 'Diseños traídos exitosamente', templates })
  } catch (error) {
    console.error('Error al obtener los diseños del usuario:', error)

    // Manejo de errores de acuerdo con el nombre del error lanzado
    switch (error.name) {
      case 'NotFoundError':
        return res.status(404).json({ error: error.message }) // Usuario no encontrado
      case 'InternalError':
        return res.status(500).json({ error: error.message }) // Error interno
      default:
        return res.status(500).json({ error: 'Error interno del servidor' }) // Fallback general
    }
  }
}

// ?Controller to update templates
export const UpdateTemplateController = async (req, res) => {
  try {
    const template = await UpdateTemplatesService(req.body)
    res.status(200).json({ message: 'Diseño actualizado exitosamente', template })
  } catch (error) {
    console.error('No se pudo crear el diseño', error)
    return res.status(500).json({ message: error.message, error: error.message })
  }
}

// ?Controller to create a new purchase order
export const createPurchaseController = async (req, res) => {
  const salesData = req.body
  try {
    const newSale = await createPurchaseService(salesData)
    if (salesData.status === 1) {
      res.status(201).json({ message: 'COTIZACION generada exitosamente', newSale })
    } else {
      res.status(201).json({ message: 'COMPRA generada exitosamente', newSale })
    }
  } catch (error) {
    console.error(error)

    switch (error.name) {
      case 'MissingFieldsError':
        return res.status(400).json({ error: error.message })
      case 'InvalidTotalPriceError':
        return res.status(400).json({ error: error.message })
      case 'NotFoundError':
        return res.status(404).json({ error: error.message })
      case 'ForbiddenError':
        return res.status(403).json({ error: error.message })
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const updatePurchaseToPayController = async (req, res) => {
  const data = req.body
  try {
    const newSale = await updatePurchaseToPayService(data)
    res.status(201).json({ message: 'La cotización se realizó con éxito, ahora puedes proceder con el pago.', newSale })
  } catch (error) {
    console.error(error)
    switch (error.name) {
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const updateStatusPurchaseController = async (req, res) => {
  const status = req.body.option
  const data = req.body
  try {
    let result
    switch (status) {
      case '1':
        res.status(400).json({ error: 'La venta no puede ser cambiada a estado de cotizacion por este medio.' })
        return
      case '2':
        res.status(400).json({ error: 'La venta no puede ser cambiada a estado de para pagar por este medio, tienes que cotizar el decorador en la parte superior del apartado de estados.' })
        return
      case '3':
        res.status(400).json({ error: 'La venta no puede ser cambiada a estado de Produccion por este medio, el usuario debe realizar el pago.' })
        return
      case '4':
        result = await updatePurchaseToShippedService(data)
        return res.status(200).json({ message: 'La compra cambió de estado a entregado.', data: result })
      case '5':
        result = await updatePurchaseToDeliveredService(data)
        return res.status(200).json({ message: 'La compra cambió de estado a entregado.', data: result })
      case '6':
        result = await updatePurchaseToCancelService(data)
        return res.status(200).json({ message: 'La compra cambió de estado a cancelada.', data: result })
      default:
        return res.status(400).json({ message: 'Estado no válido.' })
    }
  } catch (error) {
    console.error('Error actualizando el estado de la compra:', error)
    switch (error.name) {
      case 'MissingFieldsError':
        return res.status(400).json({ error: error.message })
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const updateToCancelPurchaseController = async (req, res) => {
  const data = req.body
  try {
    const cancel = await updatePurchaseToCancelService(data)
    res.status(201).json({ message: 'La cotización se cancelo con éxito', motivo: cancel.canceled_reason })
  } catch (error) {
    console.error(error)
    switch (error.name) {
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}

export const updateSaleToProductionController = async (req, res) => {
  const { description, id_orden_pago, id_pago_realizado, date_approve, status, checkoutType } = req.body
  const Xsignature = req.headers['x-signature']
  const PAYPAL_API_KEY = 'ibja7ed3d7df592684a264610369fc2a2232de7d814e1d08a5a686fa6e6d89e2b3a7bf6353683d5c1732a5bf02f1072283490aa3ac349347576a1080ccffad1ecda'
  const MERCADO_PAGO_API_KEY = 'd22e67f4586208fc34a8de96703c802d727ab7adf6e27056c4e4152abdd6698bbb092c907df8e5dd9db5c1a23245fa517e3164b313f2b0c73669010536cb6c4a814830'

  const requiredFields = ['description', 'date_approve', 'status', 'checkoutType'] // ?Lista de campos requeridos
  const missingFields = requiredFields.filter((field) => !req.body[field]) // ?Validar que todos los campos requeridos estén presentes
  if (missingFields.length > 0) {
    return res.status(400).json({ error: `Faltan los siguientes campos: ${missingFields.join(', ')}` })
  }

  if (checkoutType === 'MercadoPago' && !id_pago_realizado) {
    return res.status(400).json({ error: 'Faltan los siguientes campos: id_pago_realizado' })
  }

  if (checkoutType === 'PayPal' && !id_orden_pago) {
    return res.status(400).json({ error: 'Faltan los siguientes campos: id_orden_pago' })
  }

  try {
    let validation
    if (checkoutType === 'PayPal') {
      validation = ValidateSignaturePayment(PAYPAL_API_KEY, Xsignature, JSON.stringify(req.body))
    } else if (checkoutType === 'MercadoPago') {
      validation = ValidateSignaturePayment(MERCADO_PAGO_API_KEY, Xsignature, JSON.stringify(req.body))
    }
    if (!validation) {
      return res.status(400).json({ error: 'La firma de pago no es válida.' })
    }
    const payment = await updatePurchaseToProductionService(description, id_orden_pago, id_pago_realizado, date_approve, status, checkoutType)
    res.status(201).json({
      message: `El pago de la compra con ID ${description} fue realizado con éxito`,
      data: payment
    })
  } catch (error) {
    console.error(error)
    switch (error.name) {
      case 'InternalError':
        return res.status(500).json({ error: error.message })
      default:
        return res.status(500).json({ error: 'Error interno del servidor', message: error.message })
    }
  }
}
// ?Controller to send email pending design
export const notifyPendingDesignsController = async (req, res) => {
  try {
    // Obtener el ID del usuario desde los parámetros de la solicitud
    const { userId } = req.params

    // Validar que el parámetro userId esté presente
    if (!userId) {
      return res.status(400).json({ error: 'El ID del usuario es obligatorio.' })
    }

    // Llamar al servicio para enviar la notificación
    const result = await notifyPendingDesignService(userId)

    // Responder con éxito
    return res.status(200).json({
      message: 'Notificación enviada con éxito.',
      details: result
    })
  } catch (error) {
    // Manejo de errores
    return res.status(500).json({ error: error.message })
  }
}
