import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

export async function sendRecoverEmail (email, token, id) {
  if (!isValidEmail(email)) {
    throw new Error('El correo electrónico proporcionado no es válido.')
  }

  const mailOptions = {
    from: 'NuPack',
    to: email,
    subject: 'Recuperación de contraseña - NuPack',
    html: RecoverPassEmail(token, id)
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error(`Error al enviar el correo a ${email}: ${error.message}`)
    throw new Error('No se pudo enviar el correo electrónico. Intenta nuevamente más tarde.')
  }
}

function RecoverPassEmail (token, id) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <style>
        html {
            background-color: white;
        }
        body {
            max-width: 600px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: auto;
            background-color: rgb(229, 255, 246);
            padding: 40px;
            border-radius: 4px;
            margin-top: 10px;
        }
    </style>
    <body>
        <h1>Recuperación de contraseña</h1>
        <p>Hemos enviado un correo electrónico de recuperación de contraseña para tu cuenta de NuPack.</p>
        <p>Por favor, sigue las instrucciones en el correo electrónico para restablecer tu contraseña.</p>
        <p>Cambia la contraseña de la cuenta: <a href="http://localhost:5173/recoverPassword?token=${token}" target="_blank" rel="noopener noreferrer">haciendo click aquí</a>.</p>
    </body>
    </html>
    `
}

function isValidEmail (email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
