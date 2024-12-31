const allowOrigins = ['https://panelnupak.disruptiveinfotech.com', 'http://localhost:5173', 'https://mercadopago.disruptiveinfotech.com']

export const CorsConfig = {
  origin: allowOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}
