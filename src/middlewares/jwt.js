import jwt from "jsonwebtoken";


const TOKEN_SECRET = process.env.JWT_SECRET

export function createToken(payload) {
  
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      {
        expiresIn: "12h",
      },
      (err, accessToken) => {
        if (err) {
          console.error('Error al crear el token:', err.message, 'Payload:', payload);
          return reject(new Error(`Error al crear el token: ${err.message}`));
        }
        resolve(accessToken);
    }
    );
  });
}

export async function verifyToken({accessToken}) {

  console.log("Un usuario mantiene su sesión:", accessToken);
  try {
    await jwt.verify(accessToken, TOKEN_SECRET);

    const decode = await jwt.decode(accessToken);
    return decode;
  } catch (error) {
    throw error;
  }
}