import jwt from 'jsonwebtoken'

export const validateJWT = (req, res, next) => {
  const TOKEN_SECRET = process.env.JWT_SECRET

  // Obtener el token del encabezado Authorization
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' })

  const token = authHeader.split(' ')[1] // Suponiendo que el esquema es "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'Invalid token.' })

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Error in authentication.', error: err })

    req.user = user
    next()
  })
}
