// Utilidades para el RUT chileno (ej: "10.333.222-K").

// Quita puntos, guiones y espacios, y deja la K en mayúscula: "10333222K".
export function limpiarRut(rut) {
  return String(rut).replace(/[^0-9kK]/g, "").toUpperCase()
}

// Calcula el dígito verificador con el algoritmo módulo 11.
export function calcularDv(cuerpo) {
  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  const resto = 11 - (suma % 11)
  if (resto === 11) return "0"
  if (resto === 10) return "K"
  return String(resto)
}

export function validarRut(rut) {
  const limpio = limpiarRut(rut)
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false
  return calcularDv(limpio.slice(0, -1)) === limpio.slice(-1)
}

// Formato en que se guarda en la base de datos: "10333222-K".
export function formatearRut(rut) {
  const limpio = limpiarRut(rut)
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`
}
