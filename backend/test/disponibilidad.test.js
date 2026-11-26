import assert from "node:assert/strict"
import { test } from "node:test"
import { calcularDisponibilidad, diaSemana, generarBloques } from "../src/utils/disponibilidad.js"

const TRAMOS = [
  { hora_inicio: "09:00", hora_fin: "12:30", intervalo_min: 30 },
  { hora_inicio: "14:00", hora_fin: "16:30", intervalo_min: 30 }
]

test("genera los mismos bloques que tenía el frontend", () => {
  assert.deepEqual(generarBloques(TRAMOS), [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "14:00", "14:30", "15:00", "15:30", "16:00"
  ])
})

test("calcula el día de la semana", () => {
  assert.equal(diaSemana("2026-10-25"), 0) // domingo
  assert.equal(diaSemana("2026-10-26"), 1) // lunes
  assert.equal(diaSemana("2026-10-31"), 6) // sábado
})

test("marca como ocupadas las horas reservadas", () => {
  const horarios = calcularDisponibilidad({
    fecha: "2026-11-02", tramos: TRAMOS, ocupadas: ["10:00"], bloqueado: false,
    ahora: { fecha: "2026-10-27", hora: "08:00" }
  })
  assert.equal(horarios.find(h => h.hora === "10:00").disponible, false)
  assert.equal(horarios.find(h => h.hora === "10:30").disponible, true)
})

test("hoy no ofrece horas que ya pasaron", () => {
  const horarios = calcularDisponibilidad({
    fecha: "2026-10-27", tramos: TRAMOS, ocupadas: [], bloqueado: false,
    ahora: { fecha: "2026-10-27", hora: "11:15" }
  })
  assert.equal(horarios.find(h => h.hora === "11:00").disponible, false)
  assert.equal(horarios.find(h => h.hora === "11:30").disponible, true)
})

test("no hay horas en fechas pasadas, bloqueadas o sin atención", () => {
  const ahora = { fecha: "2026-10-27", hora: "08:00" }
  assert.deepEqual(calcularDisponibilidad({ fecha: "2026-10-26", tramos: TRAMOS, ocupadas: [], bloqueado: false, ahora }), [])
  assert.deepEqual(calcularDisponibilidad({ fecha: "2026-11-02", tramos: TRAMOS, ocupadas: [], bloqueado: true, ahora }), [])
  assert.deepEqual(calcularDisponibilidad({ fecha: "2026-11-01", tramos: [], ocupadas: [], bloqueado: false, ahora }), [])
})
