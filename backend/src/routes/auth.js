import bcrypt from "bcryptjs"
import { Router } from "express"
import jwt from "jsonwebtoken"
import config from "../config.js"
import pool from "../db.js"
import { limitar } from "../middleware/limite.js"
import { HttpError } from "../utils/errores.js"
import { loginSchema } from "../validators.js"

const router = Router()

// Hash que nunca coincide: si el correo no existe se compara igual, para que la
// respuesta tarde lo mismo y no revele qué correos existen.
const HASH_FICTICIO = "$2b$12$QDM8Ce3z4WcNRyNJvrlvVecAhYIRAFUP.bZdLAzHrCcxiNB/YgEVi"

const limiteLogin = limitar({
  maximo: 10,
  ventanaMs: 15 * 60 * 1000,
  mensaje: "Demasiados intentos de inicio de sesión. Espera 15 minutos."
})

router.post("/login", limiteLogin, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body)
  const { rows } = await pool.query("SELECT id, email, password_hash FROM admin WHERE email = $1", [email])

  // Mismo mensaje si el correo no existe o la contraseña es incorrecta, para no dar pistas.
  const coincide = await bcrypt.compare(password, rows[0]?.password_hash ?? HASH_FICTICIO)
  if (rows.length === 0 || !coincide) {
    throw new HttpError(401, "Correo o contraseña incorrectos")
  }

  const token = jwt.sign({ sub: rows[0].id, email: rows[0].email, rol: "admin" }, config.jwtSecret, { expiresIn: "8h" })
  res.json({ token, email: rows[0].email })
})

export default router
