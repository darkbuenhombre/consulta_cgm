// Aplica las migraciones de db/migraciones/ sin borrar datos existentes.
// Uso: npm run db:migrar
import pool, { migrar } from "../src/db.js"

try {
  const archivos = await migrar()
  console.log(`Migraciones aplicadas: ${archivos.join(", ") || "ninguna"}`)
} catch (error) {
  console.error("No se pudieron aplicar las migraciones:", error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
