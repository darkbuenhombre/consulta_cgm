import { ahoraEnChile, calcularDisponibilidad, diaSemana } from "../utils/disponibilidad.js"

// Consulta en la base de datos el horario, los bloqueos y las reservas de una
// fecha y calcula qué bloques están libres. "db" puede ser el pool o un cliente
// dentro de una transacción.
export async function obtenerDisponibilidad(db, fecha) {
  const [tramos, bloqueo, ocupadas] = await Promise.all([
    db.query(
      `SELECT to_char(hora_inicio, 'HH24:MI') AS hora_inicio,
              to_char(hora_fin, 'HH24:MI') AS hora_fin, intervalo_min
       FROM horario_semanal WHERE dia_semana = $1`,
      [diaSemana(fecha)]
    ),
    db.query("SELECT 1 FROM dias_bloqueados WHERE fecha = $1", [fecha]),
    db.query(
      "SELECT to_char(hora, 'HH24:MI') AS hora FROM reservas WHERE fecha = $1 AND estado <> 'cancelada'",
      [fecha]
    )
  ])

  return calcularDisponibilidad({
    fecha,
    tramos: tramos.rows,
    ocupadas: ocupadas.rows.map(r => r.hora),
    bloqueado: bloqueo.rowCount > 0,
    ahora: ahoraEnChile()
  })
}

// Consulta común para mostrar una reserva con su paciente y servicio.
export const SELECT_RESERVA = `
  SELECT r.id, r.fecha, to_char(r.hora, 'HH24:MI') AS hora, r.estado, r.token_cancelacion, r.creado_en,
         s.codigo AS servicio_codigo, s.nombre AS servicio,
         p.rut, p.nombre, p.apellido_paterno, p.apellido_materno, p.telefono, p.email
  FROM reservas r
  JOIN servicios s ON s.id = r.servicio_id
  JOIN pacientes p ON p.id = r.paciente_id`
