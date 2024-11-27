import { PrismaClient, Prisma } from '@prisma/client' // Importa Prisma y PrismaClient
const prisma = new PrismaClient()

export const getSatatusSalesDataService = async (year) => {
  // Validar el año recibido o establecer el año actual
  const targetYear = parseInt(year) || new Date().getFullYear()

  try {
    // Paso 1: Obtener todos los estados posibles
    const allStatuses = await prisma.salesStatus.findMany({
      select: { id_status: true, name: true }
    })

    // Paso 2: Definir las fechas de inicio y fin para el rango de consulta
    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`)
    const endDate = new Date(`${targetYear + 1}-01-01T00:00:00Z`)

    // Paso 3: Obtener el conteo de ventas por estado
    const salesCounts = await prisma.sales.groupBy({
      by: ['status'], // Agrupamos por el campo `status`
      _count: {
        id_sales: true // Contamos las ventas (id_sales) en cada estado
      },
      where: {
        create_at: {
          gte: startDate, // Desde el inicio del año
          lt: endDate // Hasta el inicio del siguiente año
        }
      }
    })

    // Paso 4: Mapear los resultados para incluir todos los estados
    const salesReport = allStatuses.map((status) => {
      const matchingSale = salesCounts.find((sale) => sale.status === status.id_status)
      return {
        statusId: status.id_status,
        statusName: status.name,
        salesCount: matchingSale ? matchingSale._count.id_sales : 0 // Si no hay ventas, el conteo será 0
      }
    })

    // Paso 5: Construir los datos para el gráfico
    const labels = salesReport.map((state) => state.statusName) // Nombres de los estados
    const data = salesReport.map((state) => state.salesCount) // Cantidad de ventas por estado

    const chartData = {
      labels,
      data
    }

    return chartData
  } catch (error) {
    console.error('Error al obtener los datos de ventas por estado:', error)
    throw error
  }
}

export const getTotalPurchasesDataService = async () => {
  try {
    // Obtener el año actual y el anterior
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    // Obtener las ventas con `total_price` y `purchase_at` entre los años objetivo
    const sales = await prisma.sales.findMany({
      where: {
        purchased_at: {
          not: null, // Considerar solo ventas con `purchased_at` definido
          gte: new Date(`${lastYear}-01-01T00:00:00.000Z`), // Desde el inicio del año pasado
          lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`) // Hasta el inicio del siguiente año
        },
        total_price: {
          gt: 0 // Aseguramos que solo consideremos ventas con `total_price` mayor que 0
        }
      },
      select: {
        purchased_at: true, // Fecha de la compra
        total_price: true // Precio total de la venta
      }
    })

    // Inicializar resultados para ambos años con 0 por mes
    const salesByYear = {
      [lastYear]: Array(12).fill(0), // 12 meses con valores inicializados en 0
      [currentYear]: Array(12).fill(0)
    }

    // Iterar sobre las ventas y acumular los totales mensuales
    sales.forEach((sale) => {
      const date = new Date(sale.purchased_at)
      const year = date.getFullYear()
      const month = date.getMonth() // Los meses van de 0 (Enero) a 11 (Diciembre)

      // Sumar el total de la venta al mes correspondiente
      if (salesByYear[year]) {
        salesByYear[year][month] += sale.total_price || 0 // Sumar el precio total de la venta al mes correspondiente
      }
    })

    return salesByYear // Retornar los datos organizados por año y mes
  } catch (error) {
    console.error('Error al obtener las ventas por año:', error)
    throw error
  }
}
