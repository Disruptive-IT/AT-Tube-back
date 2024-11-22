import jwt from 'jsonwebtoken'

export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}

export const authorizeClient = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedToken = await verifyToken(token)

    if (decodedToken.role !== 'Client') {
      return res.status(403).json({ message: 'No tienes permisos de administrador para acceder a este recurso.' })
    }

    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido o expirado' })
  }
}
