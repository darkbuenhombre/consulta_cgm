import { fireEvent, render, screen } from "@testing-library/react"
import App from "./App"

function respuesta(status, cuerpo) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(cuerpo) })
}

// Simula el backend. "reservar" decide qué responde POST /reservas.
function simularBackend(reservar = () => respuesta(201, {})) {
  global.fetch = jest.fn((url, opciones) => {
    if (url.endsWith("/servicios")) return respuesta(200, [{ id: 1, codigo: "limpieza", nombre: "Limpieza dental" }])
    if (url.includes("/disponibilidad")) {
      return respuesta(200, { horarios: [{ hora: "09:00", disponible: true }, { hora: "09:30", disponible: false }] })
    }
    if (url.endsWith("/reservas") && opciones.method === "POST") return reservar(JSON.parse(opciones.body))
    return respuesta(404, { error: "no simulado" })
  })
}

async function completarFormulario() {
  render(<App />)
  const campos = {
    "Nombre": "Ana", "Apellido Paterno": "Pérez", "Apellido Materno": "Soto",
    "10.333.222-k": "12.345.678-5", "Teléfono": "912345678", "Correo electrónico": "ana@ejemplo.cl"
  }
  for (const [placeholder, valor] of Object.entries(campos)) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value: valor } })
  }
  await screen.findByRole("option", { name: "Limpieza dental" })
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "limpieza" } })

  // Primer día hábil del mes siguiente (siempre es una fecha futura y no domingo).
  const hoy = new Date()
  const primero = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
  fireEvent.click(screen.getByText("→"))
  fireEvent.click(screen.getByText(primero.getDay() === 0 ? "2" : "1"))

  fireEvent.click(await screen.findByRole("button", { name: "09:00" }))
}

test("muestra el formulario con los servicios del backend", async () => {
  simularBackend()
  render(<App />)
  expect(screen.getByText("Dr. Cleomenes García")).toBeInTheDocument()
  expect(screen.getByText("Primero selecciona una fecha.")).toBeInTheDocument()
  expect(await screen.findByRole("option", { name: "Limpieza dental" })).toBeInTheDocument()
})

test("envía la reserva y muestra la confirmación", async () => {
  simularBackend(() => respuesta(201, {
    id: 1, fecha: "2026-12-01", hora: "09:00", servicio: "Limpieza dental", estado: "pendiente", token_cancelacion: "abc"
  }))
  await completarFormulario()
  expect(screen.getByRole("button", { name: "09:30" })).toBeDisabled()

  fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }))

  expect(await screen.findByText("¡Reserva confirmada!")).toBeInTheDocument()
  expect(screen.getByText("01-12-2026")).toBeInTheDocument()
  const enviado = JSON.parse(global.fetch.mock.calls.find(([, o]) => o?.method === "POST")[1].body)
  expect(enviado).toMatchObject({ servicio: "limpieza", hora: "09:00", datos: { rut: "12.345.678-5" } })
  expect(enviado.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/)
})

test("si la hora ya fue tomada muestra el error y recarga los horarios", async () => {
  simularBackend(() => respuesta(409, { error: "Ese horario ya no está disponible. Por favor elige otro." }))
  await completarFormulario()
  const consultasAntes = global.fetch.mock.calls.filter(([url]) => url.includes("/disponibilidad")).length

  fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }))

  expect(await screen.findByText(/Ese horario ya no está disponible/)).toBeInTheDocument()
  await screen.findByRole("button", { name: "09:00" })
  const consultasDespues = global.fetch.mock.calls.filter(([url]) => url.includes("/disponibilidad")).length
  expect(consultasDespues).toBe(consultasAntes + 1)
})

test("inventario: muestra alertas y resalta materiales bajo el mínimo", async () => {
  const bajo = { id: 1, name: "Lidocaína", category: "Anestésicos", sku: "ANE", quantity_on_hand: 2, minimum_threshold: 4,
    expiry_date: null, low_stock: true, expiring_soon: false }
  const ok = { id: 2, name: "Guantes", category: "Desechables", sku: "GUA", quantity_on_hand: 10, minimum_threshold: 4,
    expiry_date: null, low_stock: false, expiring_soon: false }
  global.fetch = jest.fn(url => url.includes("/low-stock")
    ? respuesta(200, { lowStock: [bajo], expiringSoon: [] })
    : respuesta(200, [bajo, ok]))
  localStorage.setItem("tokenAdmin", "x")
  window.history.pushState({}, "", "/admin/inventario")

  render(<App />)

  expect(await screen.findByRole("alert")).toHaveTextContent("Stock bajo (1)")
  expect(screen.getByTestId("material-1")).toHaveStyle({ backgroundColor: "#fdecea" })
  expect(screen.getByTestId("material-2")).not.toHaveStyle({ backgroundColor: "#fdecea" })

  localStorage.clear()
  window.history.pushState({}, "", "/")
})

test("inventario: un 403 muestra acceso denegado", async () => {
  global.fetch = jest.fn(() => respuesta(403, { error: "No tienes permiso" }))
  localStorage.setItem("tokenAdmin", "x")
  window.history.pushState({}, "", "/admin/inventario")

  render(<App />)

  expect(await screen.findByText(/Acceso denegado/)).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()

  localStorage.clear()
  window.history.pushState({}, "", "/")
})

test("no envía nada si faltan datos", async () => {
  simularBackend()
  render(<App />)
  await screen.findByRole("option", { name: "Limpieza dental" })
  fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }))
  expect(screen.getByText("Ingresa tu nombre y apellidos")).toBeInTheDocument()
  expect(global.fetch.mock.calls.some(([, o]) => o?.method === "POST")).toBe(false)
})
