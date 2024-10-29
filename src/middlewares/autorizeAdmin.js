import jwt from 'jsonwebtoken'

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        reject(new Error('Token no válido o expirado'))
      } else {
        resolve(decoded)
      }
    })
  })
}
export const authorizeAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedToken = await verifyToken(token)

    if (decodedToken.role !== 'Admin') {
      return res.status(403).json({ message: 'No tienes permisos de administrador para acceder a este recurso.' })
    }

    req.user = decodedToken
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Token no válido o expirado' })
  }
}
