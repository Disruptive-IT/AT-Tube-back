import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const checkUserVerification = async (req, res, next) => {
  try {
    // Extraer el email del cuerpo de la solicitud
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es obligatorio.' })
    }

    // Buscar al usuario en la base de datos
    const user = await prisma.Users.findUnique({
      where: { email },
      select: { is_verified: true } // Solo necesitamos verificar este campo
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }

    // Verificar si el usuario está verificado
    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Tu cuenta no está verificada. Por favor, verifica tu cuenta antes de iniciar sesión.'
      })
    }

    // Si el usuario está verificado, continuar con el siguiente middleware/controlador
    next()
  } catch (error) {
    console.error('Error en el middleware de verificación de usuario:', error)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}
