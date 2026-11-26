import dotenv from "dotenv"

dotenv.config({ quiet: true })

function requerida(nombre) {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre} (revisa el archivo .env)`)
  return valor
}

const config = {
  puerto: Number(process.env.PORT) || 4000,
  databaseUrl: requerida("DATABASE_URL"),
  jwtSecret: requerida("JWT_SECRET"),
  gmailUser: process.env.GMAIL_USER || "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000"
}

export default config
