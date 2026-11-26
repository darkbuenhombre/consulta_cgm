import cors from "cors"
import express from "express"
import { ZodError } from "zod"
import config from "./config.js"
import adminRoutes from "./routes/admin.js"
import authRoutes from "./routes/auth.js"
import inventarioRoutes from "./routes/inventario.js"
import publicoRoutes from "./routes/publico.js"

const app = express()

app.use(cors({ origin: config.frontendUrl }))
app.use(express.json())

app.get("/api/salud", (req, res) => res.json({ ok: true }))
app.use("/api", publicoRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/admin/materials", inventarioRoutes)
app.use("/api/admin", adminRoutes)

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" })
})

// Manejo central de errores: convierte cada tipo de error en una respuesta JSON clara.
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues.map(i => i.message).join(". ") })
  }
  if (err.code === "23505") {
    // Violación de una restricción UNIQUE (bloque ya reservado, código de servicio repetido, etc.)
    const mensaje = err.constraint === "reservas_bloque_unico"
      ? "Ese horario ya no está disponible. Por favor elige otro."
      : "Ya existe un registro con esos datos"
    return res.status(409).json({ error: mensaje })
  }
  if (err.status) {
    return res.status(err.status).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: "Error interno del servidor" })
})

export default app
