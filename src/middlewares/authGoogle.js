import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'

dotenv.config()

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/api/auth/google/callback' // Asegúrate de tener esta URL configurada en la consola de Google
}, (accessToken, refreshToken, profile, done) => {
  // Aquí puedes manejar la información del usuario
  // En este caso solo estamos devolviendo el perfil
  return done(null, profile)
}))

// Serialización del usuario (si es necesario)
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})
