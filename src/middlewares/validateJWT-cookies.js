import jwt from 'jsonwebtoken'
// import { TOKEN_SECRET } from "../config.js";

// import { useError } from "../helpers/useError.js";

export const validateJWT = (req, res, next) => {
  const TOKEN_SECRET = process.env.JWT_SECRET
  const { token } = req.cookies

  console.log(token)
  console.log(req.cookies)

  if (!token) return res.status(401).json({ message: 'Invalid token.' })

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Error in authentication.' })

    req.user = user

    next()
  })
}
