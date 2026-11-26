import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { api, cerrarSesion, fechaChilena, obtenerToken } from "../api"
import FormMaterial from "../components/admin/FormMaterial"
import Header from "../components/Header"
import { botonChico, botonSecundario, contenedor, input, mensajeError, VERDE } from "../estilos"

const ESTADOS = { "": "Todos", low: "Stock bajo", out: "Agotado", expiring: "Por vencer (30 días)" }

const COLUMNAS = [
  ["name", "Nombre"], ["category", "Categoría"], ["sku", "SKU"], ["quantity_on_hand", "Stock"],
  ["minimum_threshold", "Mínimo"], ["unit", "Unidad"], ["expiry_date", "Vence"], ["supplier", "Proveedor"]
]

const ROJO = "#fdecea"
const AMARILLO = "#fff6d6"

function BannerAlertas({ alertas }) {
  if (!alertas || (alertas.lowStock.length === 0 && alertas.expiringSoon.length === 0)) return null
  return (
    <div role="alert" style={{ ...mensajeError, marginTop: 0, marginBottom: "16px" }}>
      {alertas.lowStock.length > 0 && (
        <p style={{ margin: "0 0 6px" }}>
          <strong>Stock bajo ({alertas.lowStock.length}):</strong>{" "}
          {alertas.lowStock.map(m => `${m.name} (${m.quantity_on_hand}/${m.minimum_threshold})`).join(", ")}
        </p>
      )}
      {alertas.expiringSoon.length > 0 && (
        <p style={{ margin: 0 }}>
          <strong>Vencen en 30 días o menos ({alertas.expiringSoon.length}):</strong>{" "}
          {alertas.expiringSoon.map(m => `${m.name} (${fechaChilena(m.expiry_date)})`).join(", ")}
        </p>
      )}
    </div>
  )
}

function AdminInventario() {
  const navigate = useNavigate()
  const [materiales, setMateriales] = useState([])
  const [alertas, setAlertas] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [prohibido, setProhibido] = useState(false)
  const [filtros, setFiltros] = useState({ search: "", category: "", status: "" })
  const [busqueda, setBusqueda] = useState("")
  const [orden, setOrden] = useState({ columna: "name", asc: true })
  const [editando, setEditando] = useState(undefined) // undefined: cerrado, null: nuevo, objeto: editar
  const [categorias, setCategorias] = useState([])

  const manejarError = useCallback(e => {
    if (e.status === 403) setProhibido(true)
    else setError(e.message)
  }, [])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError("")
    try {
      const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v))
      const [lista, nuevasAlertas, todas] = await Promise.all([
        api(`/admin/materials?${params}`, { admin: true }),
        api("/admin/materials/low-stock", { admin: true }),
        api("/admin/materials", { admin: true })
      ])
      setMateriales(lista)
      setAlertas(nuevasAlertas)
      setCategorias([...new Set(todas.map(m => m.category))].sort())
    } catch (e) {
      manejarError(e)
    } finally {
      setCargando(false)
    }
  }, [filtros, manejarError])

  useEffect(() => {
    if (obtenerToken()) cargar()
  }, [cargar])

  // Espera a que se deje de escribir antes de buscar.
  useEffect(() => {
    const id = setTimeout(() => setFiltros(f => (f.search === busqueda ? f : { ...f, search: busqueda })), 300)
    return () => clearTimeout(id)
  }, [busqueda])

  const ordenados = useMemo(() => {
    const { columna, asc } = orden
    return [...materiales].sort((a, b) => {
      const x = a[columna] ?? ""
      const y = b[columna] ?? ""
      const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es")
      return asc ? cmp : -cmp
    })
  }, [materiales, orden])

  if (!obtenerToken()) return <Navigate to="/admin/login" replace />

  function salir() {
    cerrarSesion()
    navigate("/admin/login", { replace: true })
  }

  async function guardar(valores) {
    setError("")
    try {
      if (editando) await api(`/admin/materials/${editando.id}`, { method: "PUT", body: valores, admin: true })
      else await api("/admin/materials", { method: "POST", body: valores, admin: true })
      setEditando(undefined)
      await cargar()
    } catch (e) {
      manejarError(e)
    }
  }

  async function eliminar(material) {
    if (!window.confirm(`¿Eliminar "${material.name}"? Dejará de aparecer en el inventario, pero su historial de ajustes se conservará.`)) return
    try {
      await api(`/admin/materials/${material.id}`, { method: "DELETE", admin: true })
      await cargar()
    } catch (e) {
      manejarError(e)
    }
  }

  async function ajustar(material) {
    const texto = window.prompt(`Ajuste de stock para "${material.name}" (actual: ${material.quantity_on_hand}).\nCantidad a sumar (use negativo para restar, ej: -2):`)
    if (texto === null) return
    const reason = window.prompt("Motivo del ajuste (obligatorio):")
    if (reason === null) return
    setError("")
    try {
      await api(`/admin/materials/${material.id}/adjust`, { method: "POST", body: { delta: texto.trim(), reason }, admin: true })
      await cargar()
    } catch (e) {
      manejarError(e)
    }
  }

  function ordenarPor(columna) {
    setOrden(o => ({ columna, asc: o.columna === columna ? !o.asc : true }))
  }

  return (
    <div style={{ ...contenedor, maxWidth: "1200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Header />
        <button onClick={salir} style={botonSecundario}>Cerrar sesión</button>
      </div>
      <p><Link to="/admin" style={{ color: VERDE }}>← Volver al panel</Link></p>
      <h2 style={{ color: VERDE }}>Inventario de materiales</h2>

      {prohibido ? (
        <div style={mensajeError}>Acceso denegado: esta sección es solo para el administrador.</div>
      ) : (
        <>
          <BannerAlertas alertas={alertas} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            <input placeholder="Buscar por nombre o SKU" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ ...input, flex: "1 1 220px" }} aria-label="Buscar" />
            <select value={filtros.category} onChange={e => setFiltros(f => ({ ...f, category: e.target.value }))}
              style={input} aria-label="Categoría">
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filtros.status} onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}
              style={input} aria-label="Estado">
              {Object.entries(ESTADOS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
            <button onClick={() => setEditando(null)} style={botonChico}>+ Nuevo material</button>
          </div>

          {editando !== undefined && (
            <FormMaterial key={editando?.id ?? "nuevo"} material={editando} categorias={categorias}
              onGuardar={guardar} onCancelar={() => setEditando(undefined)} />
          )}

          {error && <div style={{ ...mensajeError, marginBottom: "12px" }}>{error}</div>}

          {cargando && materiales.length === 0 ? (
            <p>Cargando…</p>
          ) : ordenados.length === 0 ? (
            <p>No hay materiales que coincidan.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <p style={{ fontSize: "13px", color: "#555" }}>
                <span style={{ background: ROJO, padding: "2px 6px" }}>Rojo</span>: en o bajo el mínimo ·{" "}
                <span style={{ background: AMARILLO, padding: "2px 6px" }}>Amarillo</span>: vence en 30 días o menos
              </p>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `2px solid ${VERDE}` }}>
                    {COLUMNAS.map(([clave, titulo]) => (
                      <th key={clave} style={{ padding: "6px" }}>
                        <button onClick={() => ordenarPor(clave)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold", padding: 0 }}>
                          {titulo}{orden.columna === clave ? (orden.asc ? " ▲" : " ▼") : ""}
                        </button>
                      </th>
                    ))}
                    <th style={{ padding: "6px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenados.map(m => (
                    <tr key={m.id} data-testid={`material-${m.id}`}
                      style={{ borderBottom: "1px solid #ddd", backgroundColor: m.low_stock ? ROJO : m.expiring_soon ? AMARILLO : undefined }}>
                      <td style={{ padding: "6px" }}>{m.name}</td>
                      <td style={{ padding: "6px" }}>{m.category}</td>
                      <td style={{ padding: "6px" }}>{m.sku}</td>
                      <td style={{ padding: "6px", fontWeight: m.low_stock ? "bold" : undefined }}>{m.quantity_on_hand}</td>
                      <td style={{ padding: "6px" }}>{m.minimum_threshold}</td>
                      <td style={{ padding: "6px" }}>{m.unit}</td>
                      <td style={{ padding: "6px" }}>{m.expiry_date ? fechaChilena(m.expiry_date) : "—"}</td>
                      <td style={{ padding: "6px" }}>{m.supplier}</td>
                      <td style={{ padding: "6px", whiteSpace: "nowrap" }}>
                        <button onClick={() => ajustar(m)} style={botonChico}>Ajustar stock</button>{" "}
                        <button onClick={() => setEditando(m)} style={botonSecundario}>Editar</button>{" "}
                        <button onClick={() => eliminar(m)} style={{ ...botonSecundario, color: "#a12622", borderColor: "#a12622" }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminInventario
