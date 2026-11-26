import { ahoraEnChile } from "../utils/disponibilidad.js"

export const DIAS_POR_VENCER = 30

// $1 siempre es la fecha de hoy en Chile; las columnas calculadas evitan repetir las reglas en el frontend.
const SELECT_MATERIAL = `
  SELECT m.*, m.unit_cost::float AS unit_cost,
         m.quantity_on_hand <= m.minimum_threshold AS low_stock,
         (m.expiry_date IS NOT NULL AND m.expiry_date <= $1::date + ${DIAS_POR_VENCER}) AS expiring_soon
  FROM materials m`

const CONDICION_ESTADO = {
  low: "m.quantity_on_hand <= m.minimum_threshold",
  out: "m.quantity_on_hand = 0",
  expiring: `m.expiry_date <= $1::date + ${DIAS_POR_VENCER}`
}

export async function listarMateriales(db, { search, category, status } = {}) {
  const valores = [ahoraEnChile().fecha]
  const condiciones = ["m.active"]
  if (search) {
    valores.push(`%${search.replace(/[\\%_]/g, "\\$&")}%`)
    condiciones.push(`(m.name ILIKE $${valores.length} OR m.sku ILIKE $${valores.length})`)
  }
  if (category) {
    valores.push(category)
    condiciones.push(`m.category = $${valores.length}`)
  }
  if (status) condiciones.push(CONDICION_ESTADO[status])

  const { rows } = await db.query(`${SELECT_MATERIAL} WHERE ${condiciones.join(" AND ")} ORDER BY m.name`, valores)
  return rows
}

export async function obtenerMaterial(db, id) {
  const { rows } = await db.query(`${SELECT_MATERIAL} WHERE m.id = $2`, [ahoraEnChile().fecha, id])
  return rows[0]
}

// Alertas de inventario. Hoy solo se muestran en la app; para enviarlas por otro
// canal (correo, etc.) basta con llamar a esta función desde ahí.
export async function generarAlertas(db) {
  const [lowStock, expiringSoon] = await Promise.all([
    listarMateriales(db, { status: "low" }),
    listarMateriales(db, { status: "expiring" })
  ])
  return { lowStock, expiringSoon }
}
