const allowOrigins = ['https://panelnupak.disruptiveinfotech.com', 'http://localhost:5173']

export const CorsConfig = {
  origin: allowOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}
