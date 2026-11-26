import jwt from "jsonwebtoken"
import config from "../config.js"
import { HttpError } from "../utils/errores.js"

// Exige el encabezado "Authorization: Bearer <token>" con un token válido.
export function requiereAdmin(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ")
  if (tipo !== "Bearer" || !token) throw new HttpError(401, "Debes iniciar sesión")

  try {
    req.admin = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] })
  } catch {
    throw new HttpError(401, "Tu sesión expiró. Inicia sesión nuevamente.")
  }
  if (req.admin.rol !== "admin") throw new HttpError(403, "No tienes permiso para acceder a esta sección")
  next()
}
