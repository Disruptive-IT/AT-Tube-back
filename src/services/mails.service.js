import nodemailer from 'nodemailer'
import { differenceInHours } from 'date-fns'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
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

// Función para enviar correo de verificación
export const sendVerificationEmail = async (user) => {
  try {
    // Generar token de verificación
    const verificationToken = jwt.sign(
      { userId: user.id_users, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Crear enlace de verificación al endpoint del backend
    const verificationLink = `${process.env.BACKEND_URL}auth/verify-account?token=${verificationToken}`

    // Cargar y personalizar la plantilla de correo
    const filePath = path.join(emailContentDir, 'verify-account-email.html')
    let emailContent = fs.readFileSync(filePath, 'utf8')
    emailContent = emailContent.replace('{{name}}', user.name).replace('{{verificationLink}}', verificationLink)

    // Configurar el contenido del correo
    const logoPath = path.join(__dirname, '../..', 'public/images/Logo.jpg')
    const mailOptions = {
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verifica tu cuenta',
      html: emailContent.replace(
        '{{logo}}',
        'cid:logoImage' // Referencia al Content-ID del logo
      ),
      attachments: [
        {
          filename: 'Logo.jpg',
          path: logoPath, // Ruta al archivo del logo
          cid: 'logoImage' // Content-ID para incrustar en el HTML
        }
      ]
    }

    // Enviar el correo
    await transporter.sendMail(mailOptions)
    console.log(`Correo de verificación enviado a ${user.email}`)
  } catch (error) {
    console.error('Error enviando el correo de verificación: ', error.message)
    throw new Error('No se pudo enviar el correo de verificación.')
  }
}

export const resendVerificationEmailService = async (email) => {
  try {
    const user = await prisma.users.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Usuario no encontrado.')
    }

    if (user.is_verified) {
      throw new Error('La cuenta ya está verificada.')
    }

    await sendVerificationEmail(user)

    return { message: 'Correo de verificación reenviado con éxito.' }
  } catch (error) {
    throw new Error(error.message)
  }
}

export const sendResetPasswordMail = async (user, resetToken) => {
  try {
    const { email } = user

    const filePath = path.join(emailContentDir, 'reset-password-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    const resetpasswordurl = process.env.FRONTEND_URL
    const resetLink = `${resetpasswordurl}/auth/restorePassword/?token=${resetToken}`

    // Reemplazo de la plantilla con el enlace de restablecimiento
    htmlContent = htmlContent.replace('{{resetLink}}', resetLink)

    const logoPath = path.join(__dirname, '../..', 'public/images/Logo.jpg')
    const mailOptions = {
      to: email,
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: 'Restablecer contraseña - AT-Tube',
      html: htmlContent.replace(
        '{{logo}}',
        'cid:logoImage' // Referencia al Content-ID del logo
      ),
      attachments: [
        {
          filename: 'Logo.jpg',
          path: logoPath, // Ruta al archivo del logo
          cid: 'logoImage' // Content-ID para incrustar en el HTML
        }
      ]
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

    // Datos del usuario relacionado con la compra
    const { name: userName, email: userEmail, phone: userPhone } = sale.usuario || {
      name: 'Usuario desconocido',
      email: 'Correo no disponible'
    }

    // Ruta al archivo HTML del correo
    const filePath = path.join(emailContentDir, 'purchase-notify-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    // Reemplazar los campos en la plantilla del email
    htmlContent = htmlContent
      .replace('{{purchaseId}}', sale.id_sales) // ID de la venta
      .replace('{{saleDate}}', saleDate) // Fecha de la compra
      .replace('{{userName}}', userName) // Nombre del usuario
      .replace('{{userPhone}}', userPhone) // Telefono del usuario
      .replace('{{userEmail}}', userEmail) // Correo del usuario

    // Configuración del correo
    const logoPath = path.join(__dirname, '../..', 'public/images/Logo.jpg')
    const mailOptions = {
      to: admin.email, // Enviar el correo al administrador
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: 'Confirmación de Compra - AT-Tube',
      html: htmlContent.replace(
        '{{logo}}',
        'cid:logoImage' // Referencia al Content-ID del logo
      ),
      attachments: [
        {
          filename: 'Logo.jpg',
          path: logoPath, // Ruta al archivo del logo
          cid: 'logoImage' // Content-ID para incrustar en el HTML
        }
      ]
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
        usuario: true, // Información del usuario relacionado
        SalesStatus: true // Información del estado actual
      }
    })

    // Obtener detalles del usuario y la venta
    const {
      usuario: { email: userEmail, name: userName, document, phone }, // Usuario
      total_price: totalPrice,
      purchased_at: purchasedAt,
      canceled_reason: canceledReason
    } = updatedSale
    const statusName = updatedSale.SalesStatus.name || 'Estado actualizado'

    // Mensajes personalizados para cada estado
    const statusMessages = {
      1: 'Gracias por elegirnos 🤩. <br>Tu cotizacion sera revisada para darte el mejor precio! <br>Pronto recibiras una respuesta.',
      2: '¡Ya esta aqui tu cotizacion! 🤑. <br>Tu cotizacion ya esta completa por un total de : {{totalPrice}}.<br> ¡Puedes dirigirte a realizar el pago!',
      3: 'Estamos trabajando para ti 👷🏼‍♂️. <br> Tu compra esta en <strong>{{status}}</strong> <br> ¡Pronto sera enviada!',
      4: '¡Ya esta en camino! 🚛. <br> Tu compra se ha enviado a tu domicilio <br> ¡Pronto la recibiras!',
      5: '¡Tu compra ha sido entregada! 🥳. <br> Te damos las gracias por tu compra <br> Te esperamos pronto para tu siguiente compra',
      6: 'Lo sentimos 😔. <br> Tu compra ha sido cancelada. <br>Motivo: <strong>{{canceledReason}}</strong>.'
      // Agrega más estados según sea necesario
    }

    // Formatea el precio como una cadena legible
    const formattedPrice = totalPrice ? `$${totalPrice.toLocaleString('es-CO', { maximumFractionDigits: 0 })}` : 'N/A'

    // Reemplaza los marcadores en el mensaje
    let statusMessage = statusMessages[newStatus] || 'El estado de tu compra ha cambiado.'
    statusMessage = statusMessage
      .replace('{{totalPrice}}', formattedPrice)
      .replace('{{canceledReason}}', canceledReason || 'Motivo no especificado')

    // Generar y enviar el correo
    const filePath = path.join(emailContentDir, 'change-status-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    htmlContent = htmlContent
      .replace('{{clientName}}', userName)
      .replace('{{document}}', document || 'No disponible')
      .replace('{{phone}}', phone || 'No disponible')
      .replace('{{id_sale}}', saleId)
      .replace('{{totalPrice}}', totalPrice ? `$${totalPrice}` : 'N/A')
      .replace('{{purchasedAt}}', purchasedAt ? purchasedAt.toLocaleDateString() : 'N/A')
      .replace('{{status}}', statusName)
      .replace('{{statusMessage}}', statusMessage) // Mensaje dinámico por estado

    const logoPath = path.join(__dirname, '../..', 'public/images/Logo.jpg')
    const mailOptions = {
      to: userEmail,
      from: `AT-Tube <${process.env.EMAIL_USER}>`,
      subject: `Actualizacion de estado: ${statusName}`,
      html: htmlContent.replace(
        '{{logo}}',
        'cid:logoImage' // Referencia al Content-ID del logo
      ),
      attachments: [
        {
          filename: 'Logo.jpg',
          path: logoPath, // Ruta al archivo del logo
          cid: 'logoImage' // Content-ID para incrustar en el HTML
        }
      ]
    }

    // Enviar correo
    await transporter.sendMail(mailOptions)
    console.log(`Correo enviado a ${userEmail} (Estado: ${statusName})`)
    return updatedSale
  } catch (error) {
    console.error('Error actualizando estado y enviando correo:', error)
    throw new Error(`Error actualizando estado: ${error.message}`)
  }
}

export const notifyPendingDesignService = async () => {
  try {
    // Obtener los templates no relacionados con ventas y con menos de 3 notificaciones enviadas
    const templates = await prisma.templates.findMany({
      where: {
        NOT: { SalesTemplate: { some: {} } }, // No relacionados con ventas
        notification_count: { lt: 3 } // Menos de 3 notificaciones enviadas
      },
      include: { Users: true }
    })

    const now = new Date()

    for (const template of templates) {
      const { createAt, idTemplate, Users: user, notificationCount } = template

      // Calcular la diferencia en minutos
      const minutesDiff = differenceInMinutes(now, createAt)

      // Si han pasado al menos 2 minutos, enviar el correo
      if (minutesDiff >= 2) {
        if (!user) {
          console.error(`Usuario asociado al template ${idTemplate} no encontrado.`)
          continue
        }

        const { email: userEmail, name: userName } = user

        // Cargar y personalizar la plantilla del correo
        const filePath = path.join(emailContentDir, 'notify-pending-designs.html')
        let htmlContent = fs.readFileSync(filePath, 'utf8')

        htmlContent = htmlContent
          .replace('{{userName}}', userName || 'Usuario')
          .replace('{{totalPending}}', 1)
          .replace('{{designList}}', `<li>${template.design?.name || 'Sin nombre'}</li>`)

        const logoPath = path.join(__dirname, '../..', 'public/images/Logo.jpg')
        const mailOptions = {
          to: userEmail,
          from: `AT-Tube <${process.env.EMAIL_USER}>`,
          subject: 'Notificación: Diseño pendiente',
          html: htmlContent.replace('{{logo}}', 'cid:logoImage'),
          attachments: [
            {
              filename: 'Logo.jpg',
              path: logoPath,
              cid: 'logoImage'
            }
          ]
        }

        // Enviar correo
        await transporter.sendMail(mailOptions)
        console.log(`Correo enviado a ${userEmail} notificando diseño pendiente (${idTemplate}).`)

        // Incrementar el contador de notificaciones
        await prisma.templates.update({
          where: { idTemplate },
          data: { notificationCount: (notificationCount || 0) + 1 }
        })
      }
    }

    return { message: 'Proceso de notificación de diseños pendientes completado.' }
  } catch (error) {
    console.error('Error verificando diseños pendientes:', error)
    throw new Error(`Error verificando diseños: ${error.message}`)
  }
}
