// Comunicación con el backend. La URL se configura con REACT_APP_API_URL en reservas/.env
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api"
const CLAVE_TOKEN = "tokenAdmin"

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token)
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN)
}

// Hace la petición y devuelve el JSON de respuesta. Si el servidor responde con
// error, lanza un Error con el mensaje que envió el backend.
export async function api(ruta, { method = "GET", body, admin = false } = {}) {
  const headers = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (admin) headers.Authorization = `Bearer ${obtenerToken()}`

  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch {
    throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.")
  }

  // Sesión de administrador vencida o inválida: volver al login.
  if (admin && respuesta.status === 401) {
    cerrarSesion()
    window.location.assign("/admin/login")
  }

  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const error = new Error(datos?.error || "Ocurrió un error inesperado")
    error.status = respuesta.status
    throw error
  }
  return datos
}

// Convierte un Date a "YYYY-MM-DD" usando la fecha local (sin desfase de zona horaria).
export function aTextoFecha(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0")
  const dia = String(fecha.getDate()).padStart(2, "0")
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

// "2026-11-02" -> "02-11-2026"
export function fechaChilena(texto) {
  const [anio, mes, dia] = texto.split("-")
  return `${dia}-${mes}-${anio}`
}
