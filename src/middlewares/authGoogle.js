import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
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

    return cb(null, user)
  } catch (err) {
    console.error('Error in Google OAuth verification:', err)
    return cb(err)
  }
}
))

// Serializar el usuario: guarda el `id` del usuario en la sesión
passport.serializeUser((user, done) => {
  done(null, user.id_users) // Almacena el `id_users` en la sesión
})

// Deserializar el usuario: recupera el usuario de la base de datos usando el `id`
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id_users: id }
    })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})
