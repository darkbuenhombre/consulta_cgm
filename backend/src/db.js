import fs from "node:fs/promises"
import pg from "pg"
import config from "./config.js"

// Las columnas DATE se entregan como texto "YYYY-MM-DD" en vez de objetos Date,
// para evitar desfases por zona horaria.
pg.types.setTypeParser(pg.types.builtins.DATE, valor => valor)

// Si la base de datos no responde en 5 s, la petición falla en vez de quedar esperando.
const pool = new pg.Pool({ connectionString: config.databaseUrl, connectionTimeoutMillis: 5000 })

// Sin este listener, un error en una conexión inactiva (ej: PostgreSQL se reinicia) bota el proceso.
// pg ya descarta esa conexión; solo queda registrarlo.
pool.on("error", error => console.error("Error en una conexión inactiva de PostgreSQL:", error.message))

// Ejecuta una función dentro de una transacción: si lanza un error, se deshace todo.
export async function enTransaccion(fn) {
  const cliente = await pool.connect()
  try {
    await cliente.query("BEGIN")
    const resultado = await fn(cliente)
    await cliente.query("COMMIT")
    return resultado
  } catch (error) {
    await cliente.query("ROLLBACK")
    throw error
  } finally {
    cliente.release()
  }
}

// Aplica en orden los .sql de db/migraciones/ (son idempotentes y no borran datos).
export async function migrar() {
  const carpeta = new URL("../db/migraciones/", import.meta.url)
  const archivos = (await fs.readdir(carpeta)).filter(a => a.endsWith(".sql")).sort()
  for (const archivo of archivos) {
    await pool.query(await fs.readFile(new URL(archivo, carpeta), "utf8"))
  }
  return archivos
}

// Borra y vuelve a crear las tablas con los datos iniciales.
export async function crearEsquema() {
  for (const archivo of ["schema.sql", "seed.sql"]) {
    const sql = await fs.readFile(new URL(`../db/${archivo}`, import.meta.url), "utf8")
    await pool.query(sql)
  }
  await migrar()
}

export default pool
