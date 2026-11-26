import { Router } from "express"
import pool, { enTransaccion } from "../db.js"
import { requiereAdmin } from "../middleware/auth.js"
import { generarAlertas, listarMateriales, obtenerMaterial } from "../services/inventario.js"
import { HttpError, leerId } from "../utils/errores.js"
import { ajusteSchema, filtroMaterialesSchema, materialSchema } from "../validators.js"

// Montado en /api/admin/materials. Todas las rutas exigen sesión de admin.
const router = Router()
router.use(requiereAdmin)

router.get("/", async (req, res) => {
  res.json(await listarMateriales(pool, filtroMaterialesSchema.parse(req.query)))
})

router.get("/low-stock", async (req, res) => {
  res.json(await generarAlertas(pool))
})

router.post("/", async (req, res) => {
  const m = materialSchema.parse(req.body)
  const adminId = req.admin.sub

  const creado = await enTransaccion(async cliente => {
    const { rows } = await cliente.query(
      `INSERT INTO materials (name, category, sku, unit, quantity_on_hand, minimum_threshold,
                              expiry_date, supplier, unit_cost, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [m.name, m.category, m.sku, m.unit, m.quantity_on_hand, m.minimum_threshold,
        m.expiry_date, m.supplier, m.unit_cost, adminId]
    )
    const id = rows[0].id
    // El stock inicial también queda en el historial.
    if (m.quantity_on_hand > 0) {
      await cliente.query(
        "INSERT INTO stock_adjustments (material_id, delta, reason, user_id) VALUES ($1, $2, 'Stock inicial', $3)",
        [id, m.quantity_on_hand, adminId]
      )
    }
    return obtenerMaterial(cliente, id)
  })
  res.status(201).json(creado)
})

// La cantidad no se cambia aquí: solo con /adjust, para que quede registrada.
router.put("/:id", async (req, res) => {
  const id = leerId(req.params.id)
  const m = materialSchema.parse(req.body)
  const { rowCount } = await pool.query(
    `UPDATE materials SET name = $1, category = $2, sku = $3, unit = $4, minimum_threshold = $5,
       expiry_date = $6, supplier = $7, unit_cost = $8, updated_at = now(), updated_by = $9
     WHERE id = $10 AND active`,
    [m.name, m.category, m.sku, m.unit, m.minimum_threshold, m.expiry_date, m.supplier, m.unit_cost,
      req.admin.sub, id]
  )
  if (rowCount === 0) throw new HttpError(404, "Material no encontrado")
  res.json(await obtenerMaterial(pool, id))
})

// Solo desactiva el material: su historial de movimientos de stock se conserva.
// shortcut: el SKU sigue ocupado por el material desactivado; si hace falta reutilizarlo,
// permitir reactivar el material en vez de crear otro.
router.delete("/:id", async (req, res) => {
  const { rowCount } = await pool.query(
    "UPDATE materials SET active = FALSE, updated_at = now(), updated_by = $2 WHERE id = $1 AND active",
    [leerId(req.params.id), req.admin.sub]
  )
  if (rowCount === 0) throw new HttpError(404, "Material no encontrado")
  res.status(204).end()
})

router.post("/:id/adjust", async (req, res) => {
  const id = leerId(req.params.id)
  const { delta, reason } = ajusteSchema.parse(req.body)

  const material = await enTransaccion(async cliente => {
    // La condición en el WHERE evita que dos ajustes simultáneos dejen el stock negativo.
    const { rowCount } = await cliente.query(
      `UPDATE materials SET quantity_on_hand = quantity_on_hand + $1, updated_at = now(), updated_by = $2
       WHERE id = $3 AND active AND quantity_on_hand + $1 >= 0`,
      [delta, req.admin.sub, id]
    )
    if (rowCount === 0) {
      const existe = await cliente.query("SELECT 1 FROM materials WHERE id = $1 AND active", [id])
      if (existe.rowCount === 0) throw new HttpError(404, "Material no encontrado")
      throw new HttpError(409, "El stock no puede quedar negativo")
    }
    await cliente.query(
      "INSERT INTO stock_adjustments (material_id, delta, reason, user_id) VALUES ($1, $2, $3, $4)",
      [id, delta, reason, req.admin.sub]
    )
    return obtenerMaterial(cliente, id)
  })
  res.json(material)
})

export default router
