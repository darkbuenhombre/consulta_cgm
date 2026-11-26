import { Router } from "express"
import pool, { enTransaccion } from "../db.js"
import { requiereAdmin } from "../middleware/auth.js"
import { SELECT_RESERVA } from "../services/agenda.js"
import { enviarCancelacion, enviarSinFallar } from "../services/email.js"
import { HttpError, leerId } from "../utils/errores.js"
import { bloqueoSchema, estadoSchema, fechaSchema, horarioSchema, servicioSchema } from "../validators.js"

const router = Router()
router.use(requiereAdmin)

// ---------- Reservas ----------

router.get("/reservas", async (req, res) => {
  const condiciones = []
  const valores = []
  if (req.query.desde) {
    valores.push(fechaSchema.parse(req.query.desde))
    condiciones.push(`r.fecha >= $${valores.length}`)
  }
  if (req.query.hasta) {
    valores.push(fechaSchema.parse(req.query.hasta))
    condiciones.push(`r.fecha <= $${valores.length}`)
  }
  if (req.query.estado) {
    valores.push(estadoSchema.shape.estado.parse(req.query.estado))
    condiciones.push(`r.estado = $${valores.length}`)
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : ""
  const { rows } = await pool.query(`${SELECT_RESERVA} ${where} ORDER BY r.fecha, r.hora`, valores)
  res.json(rows)
})

router.patch("/reservas/:id", async (req, res) => {
  const id = leerId(req.params.id)
  const { estado } = estadoSchema.parse(req.body)

  const anterior = await pool.query(`${SELECT_RESERVA} WHERE r.id = $1`, [id])
  if (anterior.rowCount === 0) throw new HttpError(404, "Reserva no encontrada")

  // Reactivar una reserva cancelada falla con 409 si alguien más ya tomó ese bloque.
  await pool.query("UPDATE reservas SET estado = $1 WHERE id = $2", [estado, id])
  const reserva = { ...anterior.rows[0], estado }

  if (estado === "cancelada" && anterior.rows[0].estado !== "cancelada") {
    await enviarSinFallar(enviarCancelacion, reserva)
  }
  res.json(reserva)
})

// ---------- Servicios ----------

router.get("/servicios", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM servicios ORDER BY id")
  res.json(rows)
})

router.post("/servicios", async (req, res) => {
  const s = servicioSchema.parse(req.body)
  const { rows } = await pool.query(
    `INSERT INTO servicios (codigo, nombre, duracion_min, precio, activo)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [s.codigo, s.nombre, s.duracion_min, s.precio, s.activo]
  )
  res.status(201).json(rows[0])
})

router.put("/servicios/:id", async (req, res) => {
  const id = leerId(req.params.id)
  const s = servicioSchema.parse(req.body)
  const { rows } = await pool.query(
    `UPDATE servicios SET codigo = $1, nombre = $2, duracion_min = $3, precio = $4, activo = $5
     WHERE id = $6 RETURNING *`,
    [s.codigo, s.nombre, s.duracion_min, s.precio, s.activo, id]
  )
  if (rows.length === 0) throw new HttpError(404, "Servicio no encontrado")
  res.json(rows[0])
})

// ---------- Horario semanal ----------

async function leerHorario(db = pool) {
  const { rows } = await db.query(
    `SELECT id, dia_semana, to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
            to_char(hora_fin, 'HH24:MI') AS hora_fin, intervalo_min
     FROM horario_semanal ORDER BY dia_semana, hora_inicio`
  )
  return rows
}

router.get("/horario", async (req, res) => {
  res.json(await leerHorario())
})

// Reemplaza el horario completo por la lista recibida.
router.put("/horario", async (req, res) => {
  const tramos = horarioSchema.parse(req.body)
  const horario = await enTransaccion(async cliente => {
    await cliente.query("DELETE FROM horario_semanal")
    for (const t of tramos) {
      await cliente.query(
        "INSERT INTO horario_semanal (dia_semana, hora_inicio, hora_fin, intervalo_min) VALUES ($1, $2, $3, $4)",
        [t.dia_semana, t.hora_inicio, t.hora_fin, t.intervalo_min]
      )
    }
    return leerHorario(cliente)
  })
  res.json(horario)
})

// ---------- Días bloqueados ----------

router.get("/dias-bloqueados", async (req, res) => {
  const { rows } = await pool.query("SELECT fecha, motivo FROM dias_bloqueados ORDER BY fecha")
  res.json(rows)
})

router.post("/dias-bloqueados", async (req, res) => {
  const { fecha, motivo } = bloqueoSchema.parse(req.body)

  // Bloquear un día con pacientes agendados los dejaría sin atención y sin aviso:
  // primero hay que cancelar esas reservas (lo que les envía el correo de cancelación).
  const activas = await pool.query(
    "SELECT count(*)::int AS total FROM reservas WHERE fecha = $1 AND estado IN ('pendiente', 'confirmada')", [fecha])
  const total = activas.rows[0].total
  if (total > 0) {
    throw new HttpError(409, `No se puede bloquear este día: tiene ${total} ${total === 1 ? "reserva activa" : "reservas activas"}. ` +
      "Cancélalas primero en la pestaña Reservas para avisar a los pacientes.")
  }

  const { rows } = await pool.query(
    `INSERT INTO dias_bloqueados (fecha, motivo) VALUES ($1, $2)
     ON CONFLICT (fecha) DO UPDATE SET motivo = EXCLUDED.motivo RETURNING fecha, motivo`,
    [fecha, motivo]
  )
  res.status(201).json(rows[0])
})

router.delete("/dias-bloqueados/:fecha", async (req, res) => {
  const fecha = fechaSchema.parse(req.params.fecha)
  await pool.query("DELETE FROM dias_bloqueados WHERE fecha = $1", [fecha])
  res.status(204).end()
})

export default router
