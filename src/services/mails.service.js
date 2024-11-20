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
    // Buscar el administrador en la base de datos
    const admin = await prisma.Users.findFirst({
      where: { role_id: 1 } // Filtra por el rol de administrador
    })

    if (!admin) {
      console.log('No se encontró un usuario administrador.')
      return 'No admin found to send notification.'
    }

    const { email, name } = admin

    const filePath = path.join(emailContentDir, 'purchase-notify-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    // Reemplazos en la plantilla de email
    htmlContent = htmlContent
      .replace('{{userName}}', name)
      .replace('{{purchaseId}}', saleDetails.id)
      .replace('{{saleDate}}', saleDetails.date)
      .replace('{{saleTotal}}', saleDetails.total)

    const mailOptions = {
      to: email,
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: 'Confirmación de Compra - AT-Tube',
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    console.log('Purchase notification sent to admin email.')
    return 'Purchase notification sent successfully.'
  } catch (error) {
    console.error('Error sending admin purchase notification email:', error)
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
