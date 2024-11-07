import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback',
  scope: ['profile', 'email']
},
async function (accessToken, refreshToken, profile, cb) {
  try {
    // Buscar al usuario en la base de datos por `googleId`
    let user = await prisma.users.findUnique({
      where: { googleId: profile.id }
    })

    // Si el usuario no existe, lo creamos
    if (!user) {
      user = await prisma.users.create({
        data: {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          status: true,
          id_rol: 2
        }
      })
    }
    const token = jwt.sign({ id: user.id_users }, process.env.JWT_SECRET, { expiresIn: '1h' })

    return cb(null, { user, token })
  } catch (err) {
    console.error('Error in Google OAuth verification:', err)
    return cb(err)
  }
}
))

// Serializar el usuario: guarda el `id` del usuario en la sesión
passport.serializeUser((data, done) => {
  // Solo almacena el token en la sesión
  done(null, data.token)
})

passport.deserializeUser(async (token, done) => {
  try {
    // Verifica y decodifica el token para obtener los datos del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.users.findUnique({
      where: { id_users: decoded.id }
    })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})
