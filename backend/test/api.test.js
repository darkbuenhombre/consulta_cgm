// Pruebas de la API contra una base de datos real de pruebas.
// Requiere TEST_DATABASE_URL (en .env o en la terminal), apuntando a una base
// distinta de la real, porque se borra en cada ejecución.
// Ojo: todos los tests comparten el límite de 10 reservas/cancelaciones por IP
// (middleware/limite.js); si agregas más llamadas a esas rutas, el test fallará con 429.
import assert from "node:assert/strict"
import { after, before, describe, test } from "node:test"
import dotenv from "dotenv"

dotenv.config({ quiet: true })
const testDbUrl = process.env.TEST_DATABASE_URL

describe("API", { skip: !testDbUrl && "falta TEST_DATABASE_URL" }, () => {
  let request, app, pool, ahoraEnChile
  let tokenAdmin

  // Próximo lunes (al menos una semana adelante) para no depender de la hora actual.
  function proximoLunes() {
    const [a, m, d] = ahoraEnChile().fecha.split("-").map(Number)
    const fecha = new Date(Date.UTC(a, m - 1, d + 7))
    while (fecha.getUTCDay() !== 1) fecha.setUTCDate(fecha.getUTCDate() + 1)
    return fecha.toISOString().slice(0, 10)
  }

  const datos = {
    nombre: "Ana", apellido_paterno: "Pérez", apellido_materno: "Soto",
    rut: "12.345.678-5", telefono: "9 1234 5678", email: "ana@ejemplo.cl"
  }

  before(async () => {
    process.env.DATABASE_URL = testDbUrl
    process.env.JWT_SECRET = "secreto-de-prueba"
    process.env.GMAIL_USER = ""
    process.env.GMAIL_APP_PASSWORD = ""

    request = (await import("supertest")).default
    app = (await import("../src/app.js")).default
    const db = await import("../src/db.js")
    pool = db.default
    ;({ ahoraEnChile } = await import("../src/utils/disponibilidad.js"))

    await db.crearEsquema()
    const bcrypt = (await import("bcryptjs")).default
    await pool.query("INSERT INTO admin (email, password_hash) VALUES ($1, $2)",
      ["admin@consulta.cl", await bcrypt.hash("clave-segura", 4)])
  })

  after(async () => {
    await pool?.end()
  })

  test("lista los servicios", async () => {
    const res = await request(app).get("/api/servicios").expect(200)
    assert.equal(res.body.length, 6)
  })

  test("reserva, rechaza la doble reserva y cancela", async () => {
    const fecha = proximoLunes()
    const reserva = { datos, servicio: "limpieza", fecha, hora: "10:00" }

    const creada = await request(app).post("/api/reservas").send(reserva).expect(201)
    assert.ok(creada.body.token_cancelacion)

    const disp = await request(app).get(`/api/disponibilidad?fecha=${fecha}`).expect(200)
    assert.equal(disp.body.horarios.find(h => h.hora === "10:00").disponible, false)

    await request(app).post("/api/reservas").send(reserva).expect(409)

    const token = creada.body.token_cancelacion
    const detalle = await request(app).get(`/api/reservas/cancelar/${token}`).expect(200)
    assert.equal(detalle.body.cancelable, true)

    await request(app).post(`/api/reservas/cancelar/${token}`).expect(200)
    await request(app).post(`/api/reservas/cancelar/${token}`).expect(409)

    const despues = await request(app).get(`/api/disponibilidad?fecha=${fecha}`).expect(200)
    assert.equal(despues.body.horarios.find(h => h.hora === "10:00").disponible, true)
  })

  test("valida los datos del paciente", async () => {
    const res = await request(app).post("/api/reservas")
      .send({ datos: { ...datos, rut: "12.345.678-9" }, servicio: "limpieza", fecha: proximoLunes(), hora: "09:00" })
      .expect(400)
    assert.match(res.body.error, /RUT/)
  })

  test("no permite reservar fuera del horario", async () => {
    await request(app).post("/api/reservas")
      .send({ datos, servicio: "limpieza", fecha: proximoLunes(), hora: "13:00" })
      .expect(409)
  })

  test("el panel exige iniciar sesión", async () => {
    await request(app).get("/api/admin/reservas").expect(401)
    await request(app).post("/api/auth/login").send({ email: "admin@consulta.cl", password: "mala" }).expect(401)

    const login = await request(app).post("/api/auth/login")
      .send({ email: "admin@consulta.cl", password: "clave-segura" }).expect(200)
    tokenAdmin = login.body.token

    const res = await request(app).get("/api/admin/reservas").set("Authorization", `Bearer ${tokenAdmin}`).expect(200)
    assert.ok(Array.isArray(res.body))
  })

  test("un día bloqueado no tiene horas disponibles", async () => {
    const fecha = proximoLunes()
    await request(app).post("/api/admin/dias-bloqueados")
      .set("Authorization", `Bearer ${tokenAdmin}`).send({ fecha, motivo: "Feriado" }).expect(201)

    const disp = await request(app).get(`/api/disponibilidad?fecha=${fecha}`).expect(200)
    assert.deepEqual(disp.body.horarios, [])

    await request(app).delete(`/api/admin/dias-bloqueados/${fecha}`)
      .set("Authorization", `Bearer ${tokenAdmin}`).expect(204)
  })

  const admin = (metodo, ruta) => request(app)[metodo](ruta).set("Authorization", `Bearer ${tokenAdmin}`)

  test("no bloquea un día con reservas activas hasta cancelarlas", async () => {
    // Otra semana, para no chocar con las reservas de los demás tests; se inserta por SQL
    // para no gastar el límite de reservas por IP.
    const [a, m, d] = proximoLunes().split("-").map(Number)
    const fecha = new Date(Date.UTC(a, m - 1, d + 7)).toISOString().slice(0, 10)
    const { rows } = await pool.query(
      `INSERT INTO reservas (paciente_id, servicio_id, fecha, hora)
       VALUES ((SELECT id FROM pacientes LIMIT 1), (SELECT id FROM servicios LIMIT 1), $1, '10:00') RETURNING id`,
      [fecha])

    const rechazo = await admin("post", "/api/admin/dias-bloqueados").send({ fecha }).expect(409)
    assert.match(rechazo.body.error, /1 reserva activa/)

    await admin("patch", `/api/admin/reservas/${rows[0].id}`).send({ estado: "cancelada" }).expect(200)
    await admin("post", "/api/admin/dias-bloqueados").send({ fecha }).expect(201)
    await admin("delete", `/api/admin/dias-bloqueados/${fecha}`).expect(204)
  })

  test("rechaza un token inválido", async () => {
    await request(app).get("/api/admin/reservas").set("Authorization", "Bearer basura").expect(401)
  })

  test("normaliza el teléfono y el RUT del paciente", async () => {
    const fecha = proximoLunes()
    await request(app).post("/api/reservas")
      .send({ datos: { ...datos, rut: "10000013k", telefono: "+56 9 8765-4321" }, servicio: "revision", fecha, hora: "09:30" })
      .expect(201)
    const res = await admin("get", `/api/admin/reservas?desde=${fecha}&hasta=${fecha}`).expect(200)
    const reserva = res.body.find(r => r.hora === "09:30")
    assert.equal(reserva.telefono, "+56987654321")
    assert.equal(reserva.rut, "10000013-K")
  })

  test("no reactiva una reserva si otra persona ya tomó el bloque", async () => {
    const fecha = proximoLunes()
    const a = await request(app).post("/api/reservas").send({ datos, servicio: "limpieza", fecha, hora: "11:00" }).expect(201)
    await admin("patch", `/api/admin/reservas/${a.body.id}`).send({ estado: "cancelada" }).expect(200)
    await request(app).post("/api/reservas").send({ datos, servicio: "limpieza", fecha, hora: "11:00" }).expect(201)
    await admin("patch", `/api/admin/reservas/${a.body.id}`).send({ estado: "pendiente" }).expect(409)
    await admin("patch", "/api/admin/reservas/999999").send({ estado: "confirmada" }).expect(404)
  })

  test("un servicio desactivado no se puede reservar", async () => {
    const creado = await admin("post", "/api/admin/servicios")
      .send({ codigo: "implante", nombre: "Implante", precio: 500000 }).expect(201)
    await admin("put", `/api/admin/servicios/${creado.body.id}`)
      .send({ codigo: "implante", nombre: "Implante", precio: 500000, activo: false }).expect(200)

    const publicos = await request(app).get("/api/servicios").expect(200)
    assert.ok(!publicos.body.some(s => s.codigo === "implante"))
    await request(app).post("/api/reservas")
      .send({ datos, servicio: "implante", fecha: proximoLunes(), hora: "14:00" }).expect(400)
  })

  test("el horario editado cambia la disponibilidad", async () => {
    const original = await admin("get", "/api/admin/horario").expect(200)
    await admin("put", "/api/admin/horario")
      .send([{ dia_semana: 1, hora_inicio: "09:00", hora_fin: "10:00", intervalo_min: 30 }]).expect(200)

    const disp = await request(app).get(`/api/disponibilidad?fecha=${proximoLunes()}`).expect(200)
    assert.deepEqual(disp.body.horarios.map(h => h.hora), ["09:00", "09:30"])

    const demasiados = Array(51).fill({ dia_semana: 1, hora_inicio: "09:00", hora_fin: "10:00" })
    await admin("put", "/api/admin/horario").send(demasiados).expect(400)
    await admin("put", "/api/admin/horario").send(original.body).expect(200)
  })

  test("el inventario exige sesión de admin (401 sin token, 403 sin rol admin)", async () => {
    await request(app).get("/api/admin/materials").expect(401)
    const jwt = (await import("jsonwebtoken")).default
    const otro = jwt.sign({ sub: 99, rol: "recepcion" }, "secreto-de-prueba")
    for (const [metodo, ruta] of [["get", "/"], ["get", "/low-stock"], ["post", "/"], ["post", "/1/adjust"], ["delete", "/1"]]) {
      await request(app)[metodo](`/api/admin/materials${ruta}`).set("Authorization", `Bearer ${otro}`).expect(403)
    }
  })

  test("crea, busca, ajusta y elimina materiales", async () => {
    const nuevo = { name: "Composite test", category: "Resinas", sku: "TEST-1", unit: "jeringa",
      quantity_on_hand: 3, minimum_threshold: 5, expiry_date: "", unit_cost: "1500" }
    const creado = await admin("post", "/api/admin/materials").send(nuevo).expect(201)
    assert.equal(creado.body.low_stock, true)
    assert.equal(creado.body.unit_cost, 1500)
    await admin("post", "/api/admin/materials").send(nuevo).expect(409) // SKU repetido

    const busqueda = await admin("get", "/api/admin/materials?search=test-&status=low").expect(200)
    assert.deepEqual(busqueda.body.map(m => m.sku), ["TEST-1"])

    const id = creado.body.id
    await admin("post", `/api/admin/materials/${id}/adjust`).send({ delta: 5, reason: "Compra" }).expect(200)
    const ajustado = await admin("post", `/api/admin/materials/${id}/adjust`).send({ delta: -3, reason: "Uso" }).expect(200)
    assert.equal(ajustado.body.quantity_on_hand, 5)
    await admin("post", `/api/admin/materials/${id}/adjust`).send({ delta: -6, reason: "Uso" }).expect(409)
    await admin("post", `/api/admin/materials/${id}/adjust`).send({ delta: 1 }).expect(400)
    await admin("post", `/api/admin/materials/${id}/adjust`).send({ delta: 0, reason: "x" }).expect(400)

    const { rows } = await pool.query("SELECT delta FROM stock_adjustments WHERE material_id = $1 ORDER BY id", [id])
    assert.deepEqual(rows.map(r => r.delta), [3, 5, -3]) // incluye el stock inicial

    const alertas = await admin("get", "/api/admin/materials/low-stock").expect(200)
    assert.ok(alertas.body.lowStock.some(m => m.id === id)) // 5 <= mínimo 5
    assert.ok(Array.isArray(alertas.body.expiringSoon))

    await admin("put", `/api/admin/materials/${id}`).send({ ...nuevo, minimum_threshold: 1 }).expect(200)
    await admin("delete", `/api/admin/materials/${id}`).expect(204)
    await admin("delete", `/api/admin/materials/${id}`).expect(404)
    await admin("post", `/api/admin/materials/${id}/adjust`).send({ delta: 1, reason: "x" }).expect(404)
    await admin("put", `/api/admin/materials/${id}`).send(nuevo).expect(404)

    // Eliminado: sale de la lista y de las alertas, pero su historial se conserva.
    const lista = await admin("get", "/api/admin/materials").expect(200)
    assert.ok(!lista.body.some(m => m.id === id))
    const despues = await admin("get", "/api/admin/materials/low-stock").expect(200)
    assert.ok(!despues.body.lowStock.some(m => m.id === id))
    const historial = await pool.query("SELECT delta FROM stock_adjustments WHERE material_id = $1 ORDER BY id", [id])
    assert.deepEqual(historial.rows.map(r => r.delta), [3, 5, -3])
  })

  // Estos dos tests van al final: dejan la IP de prueba bloqueada.
  test("limita las reservas por IP", async () => {
    let res
    for (let i = 0; i < 12 && res?.status !== 429; i++) {
      res = await request(app).post("/api/reservas").send({})
    }
    assert.equal(res.status, 429)
    assert.ok(Number(res.headers["retry-after"]) > 0)
  })

  test("limita los intentos de login por IP", async () => {
    let res
    for (let i = 0; i < 12 && res?.status !== 429; i++) {
      res = await request(app).post("/api/auth/login").send({ email: "admin@consulta.cl", password: "mala" })
    }
    assert.equal(res.status, 429)
  })
})
