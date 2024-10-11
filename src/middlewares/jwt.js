import jwt from 'jsonwebtoken'

export function createToken (payload) {
  const TOKEN_SECRET = process.env.JWT_SECRET

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

export async function verifyToken ({ accessToken }) {
  const TOKEN_SECRET = process.env.JWT_SECRET
  console.log('Un usuario mantiene su sesión:', accessToken)
  // eslint-disable-next-line no-useless-catch
  try {
    await jwt.verify(accessToken, TOKEN_SECRET)

    const decode = await jwt.decode(accessToken)
    return decode
  } catch (error) {
    throw error
  }
}
