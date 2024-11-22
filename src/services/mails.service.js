import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const emailContentDir = path.resolve(__dirname, '../../public/email/')
// Configuración de transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.SMTP_PORT === '465', // Si el puerto es 465, usa conexión segura
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export const sendResetPasswordMail = async (user, resetToken) => {
  try {
    const { email } = user

    const filePath = path.join(emailContentDir, 'reset-password-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    const resetpasswordurl = process.env.FRONTEND_URL
    const resetLink = `${resetpasswordurl}/auth/restorePassword/?token=${resetToken}`

    // Reemplazo de la plantilla con el enlace de restablecimiento
    htmlContent = htmlContent.replace('{{resetLink}}', resetLink)

    const mailOptions = {
      to: email,
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: 'Restablecer contraseña - AT-Tube',
      html: htmlContent
    }

    // Enviar correo y manejar errores
    await transporter.sendMail(mailOptions)
    console.log('Reset link sent to user email.')
    return 'Reset link sent to user email.'
  } catch (error) {
    console.error('Error sending user request password email:', error)
    throw new Error(`Error sending email: ${error.message}`)
  }
}
export const sendAdminPurchaseNotification = async (saleDetails) => {
  try {
    // Obtener el administrador (usuario con rol de administrador)
    const admin = await prisma.users.findFirst({
      where: { id_rol: 1 } // Rol de administrador
    })

    if (!admin) {
      console.log('No se encontró un usuario administrador.')
      return 'No admin found to send notification.'
    }

    // Detalles del administrador
    const { email, name } = admin

    // Detalles de la venta
    const sale = await prisma.sales.findUnique({
      where: { id_sales: saleDetails.id },
      include: {
        usuario: true // Relación con el usuario
      }
    })

    if (!sale) {
      console.log(`No se encontró una venta con el ID: ${saleDetails.id}`)
      return 'Sale not found.'
    }

    // Detalles adicionales de la venta
    const saleDate = sale.create_at
      ? new Date(sale.create_at).toLocaleDateString('es-ES')
      : 'Fecha no disponible'
    const saleTotal = sale.total_price || 0

    // Ruta al archivo HTML del correo
    const filePath = path.join(emailContentDir, 'purchase-notify-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    // Reemplazar los campos en la plantilla del email
    htmlContent = htmlContent
      .replace('{{purchaseId}}', sale.id_sales) // ID de la venta
      .replace('{{saleDate}}', saleDate) // Fecha de la compra
      .replace('{{saleTotal}}', saleTotal.toString()) // Total de la compra

    // Configuración del correo
    const mailOptions = {
      to: email,
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: 'Confirmación de Compra - AT-Tube',
      html: htmlContent
    }

    // Enviar el correo
    await transporter.sendMail(mailOptions)
    console.log('Notificación de compra enviada al administrador.')
    return 'Purchase notification sent successfully.'
  } catch (error) {
    console.error('Error enviando notificación de compra al administrador:', error)
    throw new Error(`Error sending email: ${error.message}`)
  }
}

export const changeStatusEmail = async (saleId, newStatus) => {
  try {
    // Actualizar el estado de la venta y obtener los datos necesarios
    const updatedSale = await prisma.sales.update({
      where: { id_sales: saleId },
      data: { status: newStatus },
      include: {
        usuario: true, // Relación con el usuario asociado a la venta
        SalesStatus: true // Relación con el estado de la venta
      }
    })

    // Obtener detalles del usuario
    const { email: userEmail, name: userName } = updatedSale.usuario
    const { total_price: totalPrice } = updatedSale
    const statusName = updatedSale.SalesStatus.name // Nombre del estado (si existe esta columna)

    // Generar y enviar el correo
    const filePath = path.join(emailContentDir, 'change-status-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    htmlContent = htmlContent
      .replace('{{clientName}}', userName)
      .replace('{{id_sale}}', saleId)
      .replace('{{totalPrice}}', totalPrice || 'N/A')
      .replace('{{status}}', statusName || 'Estado actualizado') // Usa el nombre del estado

    const mailOptions = {
      to: userEmail,
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: `Estado de tu compra: ${statusName}`,
      html: htmlContent
    }

    // Enviar correo
    await transporter.sendMail(mailOptions)
    console.log(`Correo enviado al cliente: ${userEmail} por el estado: ${statusName}`)
    return updatedSale
  } catch (error) {
    console.error('Error actualizando estado y enviando correo:', error)
    throw new Error(`Error actualizando estado: ${error.message}`)
  }
}
