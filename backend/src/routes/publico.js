import { Router } from "express"
import pool, { enTransaccion } from "../db.js"
import { limitar } from "../middleware/limite.js"
import { obtenerDisponibilidad, SELECT_RESERVA } from "../services/agenda.js"
import { enviarCancelacion, enviarConfirmacion, enviarSinFallar } from "../services/email.js"
import { ahoraEnChile } from "../utils/disponibilidad.js"
import { HttpError } from "../utils/errores.js"
import { fechaSchema, reservaSchema, tokenSchema } from "../validators.js"

const router = Router()

// Cada reserva y cancelación envía un correo: se limita para evitar spam.
const limiteReservas = limitar({
  maximo: 10,
  ventanaMs: 60 * 60 * 1000,
  mensaje: "Demasiadas solicitudes desde tu conexión. Intenta nuevamente en una hora."
})

router.get("/servicios", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, codigo, nombre, duracion_min, precio FROM servicios WHERE activo ORDER BY id"
  )
  res.json(rows)
})

router.get("/disponibilidad", async (req, res) => {
  const fecha = fechaSchema.parse(req.query.fecha)
  res.json({ fecha, horarios: await obtenerDisponibilidad(pool, fecha) })
})

router.post("/reservas", limiteReservas, async (req, res) => {
  const { datos, servicio, fecha, hora } = reservaSchema.parse(req.body)

  const reserva = await enTransaccion(async cliente => {
    const servicioDb = await cliente.query("SELECT id FROM servicios WHERE codigo = $1 AND activo", [servicio])
    if (servicioDb.rowCount === 0) throw new HttpError(400, "El servicio seleccionado no existe")

    const bloques = await obtenerDisponibilidad(cliente, fecha)
    if (!bloques.some(b => b.hora === hora && b.disponible)) {
      throw new HttpError(409, "Ese horario ya no está disponible. Por favor elige otro.")
    }

    // Si el paciente ya existe (mismo RUT), se actualizan sus datos de contacto.
    const paciente = await cliente.query(
      `INSERT INTO pacientes (rut, nombre, apellido_paterno, apellido_materno, telefono, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (rut) DO UPDATE SET
         nombre = EXCLUDED.nombre, apellido_paterno = EXCLUDED.apellido_paterno,
         apellido_materno = EXCLUDED.apellido_materno, telefono = EXCLUDED.telefono, email = EXCLUDED.email
       RETURNING id`,
      [datos.rut, datos.nombre, datos.apellido_paterno, datos.apellido_materno, datos.telefono, datos.email]
    )

    const nueva = await cliente.query(
      "INSERT INTO reservas (paciente_id, servicio_id, fecha, hora) VALUES ($1, $2, $3, $4) RETURNING id",
      [paciente.rows[0].id, servicioDb.rows[0].id, fecha, hora]
    )
    const { rows } = await cliente.query(`${SELECT_RESERVA} WHERE r.id = $1`, [nueva.rows[0].id])
    return rows[0]
  })

  await enviarSinFallar(enviarConfirmacion, reserva)

  res.status(201).json({
    id: reserva.id,
    fecha: reserva.fecha,
    hora: reserva.hora,
    servicio: reserva.servicio,
    estado: reserva.estado,
    token_cancelacion: reserva.token_cancelacion
  })
})

async function buscarPorToken(token) {
  if (!tokenSchema.safeParse(token).success) throw new HttpError(404, "Reserva no encontrada")
  const { rows } = await pool.query(`${SELECT_RESERVA} WHERE r.token_cancelacion = $1`, [token])
  if (rows.length === 0) throw new HttpError(404, "Reserva no encontrada")
  return rows[0]
}

function esFutura(reserva) {
  const ahora = ahoraEnChile()
  return reserva.fecha > ahora.fecha || (reserva.fecha === ahora.fecha && reserva.hora > ahora.hora)
}

// Solo se entregan los datos necesarios para mostrar la reserva al paciente.
function resumenPublico(reserva) {
  return {
    fecha: reserva.fecha,
    hora: reserva.hora,
    servicio: reserva.servicio,
    estado: reserva.estado,
    nombre: reserva.nombre,
    cancelable: ["pendiente", "confirmada"].includes(reserva.estado) && esFutura(reserva)
  }
}

router.get("/reservas/cancelar/:token", async (req, res) => {
  res.json(resumenPublico(await buscarPorToken(req.params.token)))
})

router.post("/reservas/cancelar/:token", limiteReservas, async (req, res) => {
  const reserva = await buscarPorToken(req.params.token)
  if (!resumenPublico(reserva).cancelable) {
    throw new HttpError(409, "Esta reserva ya no se puede cancelar")
  }

  await pool.query("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [reserva.id])
  reserva.estado = "cancelada"
  await enviarSinFallar(enviarCancelacion, reserva)

  res.json(resumenPublico(reserva))
})

export default router
