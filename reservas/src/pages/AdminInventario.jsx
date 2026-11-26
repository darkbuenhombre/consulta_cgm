import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { api, cerrarSesion, fechaChilena, obtenerToken } from "../api"
import FormMaterial from "../components/admin/FormMaterial"
import Header from "../components/Header"
import { AZUL, botonChico, botonPeligro, botonSecundario, contenedor, input, mensajeError, tarjeta, textoSuave } from "../estilos"

const ESTADOS = { "": "Todos", low: "Stock bajo", out: "Agotado", expiring: "Por vencer (30 días)" }

const COLUMNAS = [
  ["name", "Nombre"], ["category", "Categoría"], ["sku", "SKU"], ["quantity_on_hand", "Stock"],
  ["minimum_threshold", "Mínimo"], ["unit", "Unidad"], ["expiry_date", "Vence"], ["supplier", "Proveedor"]
]

// Hex en vez de var(): los tests comparan estos colores.
const ROJO = "#FEF2F2"
const AMARILLO = "#FFFBEB"

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

// Recuadro para ajustar el stock: se fija la cantidad nueva y se envía la diferencia como ajuste.
function AjusteStock({ material, onGuardar, onCancelar }) {
  const [cantidad, setCantidad] = useState(material.quantity_on_hand)
  const [motivo, setMotivo] = useState("")
  const [guardando, setGuardando] = useState(false)
  const delta = cantidad - material.quantity_on_hand

  async function enviar(e) {
    e.preventDefault()
    setGuardando(true)
    await onGuardar(material, delta, motivo)
    setGuardando(false)
  }

  return (
    <form onSubmit={enviar} style={{ ...tarjeta, marginBottom: "12px" }} aria-label="Ajustar stock">
      <h3 style={{ marginTop: 0 }}>Ajustar stock: {material.name}</h3>
      <p style={{ margin: "0 0 8px" }}>Stock actual: {material.quantity_on_hand} {material.unit}</p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
        <button type="button" onClick={() => setCantidad(c => Math.max(0, c - 1))} disabled={cantidad <= 0}
          style={botonSecundario} aria-label="Reducir stock">−</button>
        <input type="number" min="0" step="1" value={cantidad} aria-label="Nuevo stock"
          onChange={e => setCantidad(e.target.value === "" ? 0 : Math.max(0, Math.trunc(Number(e.target.value))))}
          style={{ ...input, width: "90px" }} />
        <button type="button" onClick={() => setCantidad(c => c + 1)} style={botonSecundario} aria-label="Aumentar stock">+</button>
        <span style={textoSuave}>Cambio: {delta > 0 ? `+${delta}` : delta}</span>
      </div>
      <input placeholder="Motivo del ajuste (obligatorio)" value={motivo} onChange={e => setMotivo(e.target.value)}
        required maxLength={200} aria-label="Motivo del ajuste" style={{ ...input, width: "100%", margin: "var(--esp-3) 0" }} />
      <button type="submit" disabled={guardando || delta === 0 || !motivo.trim()} style={botonChico}>Guardar ajuste</button>{" "}
      <button type="button" onClick={onCancelar} style={botonSecundario}>Cancelar</button>
    </form>
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
  const [ajustando, setAjustando] = useState(null) // material cuyo stock se está ajustando

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

  async function ajustar(material, delta, reason) {
    setError("")
    try {
      await api(`/admin/materials/${material.id}/adjust`, { method: "POST", body: { delta, reason }, admin: true })
      setAjustando(null)
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--esp-3)", flexWrap: "wrap" }}>
        <Header />
        <button onClick={salir} style={botonSecundario}>Cerrar sesión</button>
      </div>
      <p style={{ marginTop: "var(--esp-5)" }}><Link to="/admin" style={{ fontSize: "var(--texto-sm)" }}>← Volver al panel</Link></p>
      <h2 style={{ marginTop: "var(--esp-2)" }}>Inventario de materiales</h2>

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

          {ajustando && (
            <AjusteStock key={ajustando.id} material={ajustando} onGuardar={ajustar} onCancelar={() => setAjustando(null)} />
          )}

          {error && <div style={{ ...mensajeError, marginBottom: "12px" }}>{error}</div>}

          {cargando && materiales.length === 0 ? (
            <p>Cargando…</p>
          ) : ordenados.length === 0 ? (
            <p>No hay materiales que coincidan.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <p style={{ ...textoSuave, fontSize: "var(--texto-xs)" }}>
                <span style={{ background: ROJO, padding: "2px 8px", borderRadius: "4px", color: "var(--error)" }}>Rojo</span>: en o bajo el mínimo ·{" "}
                <span style={{ background: AMARILLO, padding: "2px 8px", borderRadius: "4px", color: "var(--aviso)" }}>Amarillo</span>: vence en 30 días o menos
              </p>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--borde)" }}>
                    {COLUMNAS.map(([clave, titulo]) => (
                      <th key={clave} style={{ padding: "10px 8px" }}>
                        <button onClick={() => ordenarPor(clave)}
                          style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: orden.columna === clave ? AZUL : "inherit", textTransform: "inherit", letterSpacing: "inherit", padding: 0 }}>
                          {titulo}{orden.columna === clave ? (orden.asc ? " ▲" : " ▼") : ""}
                        </button>
                      </th>
                    ))}
                    <th style={{ padding: "10px 8px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenados.map(m => (
                    <tr key={m.id} data-testid={`material-${m.id}`}
                      style={{ borderBottom: "1px solid var(--borde)", backgroundColor: m.low_stock ? ROJO : m.expiring_soon ? AMARILLO : undefined }}>
                      <td style={{ padding: "10px 8px" }}>{m.name}</td>
                      <td style={{ padding: "10px 8px" }}>{m.category}</td>
                      <td style={{ padding: "10px 8px" }}>{m.sku}</td>
                      <td style={{ padding: "10px 8px", fontWeight: m.low_stock ? "bold" : undefined }}>{m.quantity_on_hand}</td>
                      <td style={{ padding: "10px 8px" }}>{m.minimum_threshold}</td>
                      <td style={{ padding: "10px 8px" }}>{m.unit}</td>
                      <td style={{ padding: "10px 8px" }}>{m.expiry_date ? fechaChilena(m.expiry_date) : "—"}</td>
                      <td style={{ padding: "10px 8px" }}>{m.supplier}</td>
                      <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                        <button onClick={() => setAjustando(m)} style={botonChico}>Ajustar stock</button>{" "}
                        <button onClick={() => setEditando(m)} style={botonSecundario}>Editar</button>{" "}
                        <button onClick={() => eliminar(m)} style={botonPeligro}>Eliminar</button>
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
