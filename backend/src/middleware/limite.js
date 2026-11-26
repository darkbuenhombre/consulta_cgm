import { HttpError } from "../utils/errores.js"

// Limita cuántas peticiones puede hacer cada IP en una ventana de tiempo
// (contra fuerza bruta en el login y spam de reservas o correos).
// shortcut: contador en memoria, se reinicia con el servidor y no se comparte entre
// varias instancias; si se despliega con varias instancias, usar Redis. Detrás de un
// proxy (nginx, Render, etc.) hay que activar app.set("trust proxy", 1) para que req.ip sea la IP real.
export function limitar({ maximo, ventanaMs, mensaje }) {
  const intentos = new Map() // ip -> { cuenta, reinicio }

  return (req, res, next) => {
    const ahora = Date.now()
    if (intentos.size > 10000) {
      for (const [ip, r] of intentos) if (r.reinicio <= ahora) intentos.delete(ip)
    }

    let registro = intentos.get(req.ip)
    if (!registro || registro.reinicio <= ahora) {
      registro = { cuenta: 0, reinicio: ahora + ventanaMs }
      intentos.set(req.ip, registro)
    }

    if (++registro.cuenta > maximo) {
      res.set("Retry-After", String(Math.ceil((registro.reinicio - ahora) / 1000)))
      throw new HttpError(429, mensaje)
    }
    next()
  }
}
