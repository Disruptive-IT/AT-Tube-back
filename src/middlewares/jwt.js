import jwt from 'jsonwebtoken'

export function createToken (user) {
  const TOKEN_SECRET = process.env.JWT_SECRET

  const payload = {
    name: user.name,
    role: user.role
  }

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      {
        expiresIn: '12h'
      },
      (err, accessToken) => {
        if (err) {
          console.error('Error al crear el token:', err.message, 'Payload:', payload)
          return reject(new Error(`Error al crear el token: ${err.message}`))
        }
        resolve(accessToken)
      }
    )
  })
}

export async function verifyToken (accessToken) {
  const TOKEN_SECRET = process.env.JWT_SECRET
  console.log('Un usuario mantiene su sesión:', accessToken)

  try {
    await jwt.verify(accessToken, TOKEN_SECRET)
    const decoded = await jwt.decode(accessToken)
    return decoded
  } catch (error) {
    throw new Error('Token no válido o expirado')
  }
}
