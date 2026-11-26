// Crea (o vuelve a crear) las tablas y carga los datos iniciales.
// ¡Cuidado! Borra todas las reservas existentes.
// Uso: npm run db:init
import pool, { crearEsquema } from "../src/db.js"

try {
  await crearEsquema()
  console.log("Base de datos creada con los servicios y horarios iniciales.")
  console.log("Ahora crea la cuenta de administrador: npm run crear-admin -- correo@ejemplo.cl contraseña")
} catch (error) {
  console.error("No se pudo crear la base de datos:", error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
