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
        decorator,
      }
    })
    return newTemplate
  } catch (error) {
    console.error('Error al crear el diseno:', error)
    throw error
  }
}
