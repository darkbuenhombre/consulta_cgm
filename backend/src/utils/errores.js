// Error con código HTTP, para responder al cliente con un mensaje claro.
export class HttpError extends Error {
  constructor(status, mensaje) {
    super(mensaje)
    this.status = status
  }
}

// Convierte el :id de la URL en número; si no es válido, responde 404.
export function leerId(id) {
  const numero = Number(id)
  if (!Number.isInteger(numero) || numero <= 0) throw new HttpError(404, "No encontrado")
  return numero
}
