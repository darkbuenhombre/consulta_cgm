// Crea la cuenta de administrador, o la reemplaza si ya existe (hay una sola).
// Uso: npm run crear-admin -- correo@ejemplo.cl contraseña
import bcrypt from "bcryptjs"
import pool, { enTransaccion } from "../src/db.js"
import { loginSchema } from "../src/validators.js"

const [email, password] = process.argv.slice(2)
const datos = loginSchema.safeParse({ email, password })

if (!datos.success || password.length < 8) {
  console.error("Uso: npm run crear-admin -- correo@ejemplo.cl contraseña  (mínimo 8 caracteres)")
  process.exit(1)
}

try {
  const hash = await bcrypt.hash(datos.data.password, 12)
  await enTransaccion(async cliente => {
    await cliente.query("DELETE FROM admin")
    await cliente.query("INSERT INTO admin (email, password_hash) VALUES ($1, $2)", [datos.data.email, hash])
  })
  console.log(`Administrador listo: ${datos.data.email}`)
} catch (error) {
  console.error("No se pudo crear el administrador:", error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
