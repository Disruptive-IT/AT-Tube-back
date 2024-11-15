import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const emailContentDir = path.resolve(__dirname, '../../public/email/')

export const sendResetPasswordMail = async (user, resetToken) => {
  try {
    const { email } = user

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

    const filePath = path.join(emailContentDir, 'reset-password-email.html')
    let htmlContent = fs.readFileSync(filePath, 'utf8')

    const resetpasswordurl = process.env.FRONTEND_URL
    const resetLink = `${resetpasswordurl}/auth/restorePassword/?token=${resetToken}`

    // Reemplazo de la plantilla con el enlace de restablecimiento
    htmlContent = htmlContent.replace('{{resetLink}}', resetLink)

    const mailOptions = {
      to: email,
      from: `NuPak <${process.env.EMAIL_USER}>`,
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
