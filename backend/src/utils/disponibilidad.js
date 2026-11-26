// Cálculo de los bloques horarios disponibles. Son funciones puras (no usan
// la base de datos), para poder probarlas fácilmente.

function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

function aHora(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0")
  const m = String(minutos % 60).padStart(2, "0")
  return `${h}:${m}`
}

// Convierte tramos como { hora_inicio: "09:00", hora_fin: "12:30", intervalo_min: 30 }
// en la lista ordenada de horas de inicio: ["09:00", "09:30", ..., "12:00"].
export function generarBloques(tramos) {
  const bloques = new Set()
  for (const tramo of tramos) {
    const fin = aMinutos(tramo.hora_fin)
    for (let t = aMinutos(tramo.hora_inicio); t + tramo.intervalo_min <= fin; t += tramo.intervalo_min) {
      bloques.add(aHora(t))
    }
  }
  return [...bloques].sort()
}

// Día de la semana de una fecha "YYYY-MM-DD": 0 = domingo ... 6 = sábado.
export function diaSemana(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()
}

// Fecha y hora actuales en Chile, sin importar la zona horaria del servidor.
export function ahoraEnChile() {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Santiago",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).map(p => [p.type, p.value])
  )
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`
  }
}

// Devuelve [{ hora, disponible }] para una fecha. La lista queda vacía si la
// fecha ya pasó, está bloqueada o no hay atención ese día.
export function calcularDisponibilidad({ fecha, tramos, ocupadas, bloqueado, ahora }) {
  if (fecha < ahora.fecha || bloqueado) return []

  return generarBloques(tramos).map(hora => ({
    hora,
    disponible: !ocupadas.includes(hora) && !(fecha === ahora.fecha && hora <= ahora.hora)
  }))
}
