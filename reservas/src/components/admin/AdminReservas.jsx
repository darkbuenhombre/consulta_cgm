import { useCallback, useEffect, useState } from "react"
import { api, aTextoFecha, fechaChilena } from "../../api"
import { input, mensajeError } from "../../estilos"

const ESTADOS = ["pendiente", "confirmada", "cancelada", "completada"]

const COLORES_ESTADO = {
  pendiente: "#b26a00",
  confirmada: "#2C5F4A",
  cancelada: "#a12622",
  completada: "#555"
}

const celda = { padding: "8px", borderBottom: "1px solid #ddd", textAlign: "left", verticalAlign: "top" }

function AdminReservas() {
  const [filtros, setFiltros] = useState({ desde: aTextoFecha(new Date()), hasta: "", estado: "" })
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  const cargar = useCallback(async () => {
    setCargando(true)
    setError("")
    const params = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v))
    try {
      setReservas(await api(`/admin/reservas?${params}`, { admin: true }))
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [filtros])

  useEffect(() => { cargar() }, [cargar])

  function cambiarFiltro(e) {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function cambiarEstado(reserva, estado) {
    if (estado === "cancelada" && !window.confirm("Se cancelará la hora y se avisará al paciente por correo. ¿Continuar?")) return
    setError("")
    try {
      const actualizada = await api(`/admin/reservas/${reserva.id}`, { method: "PATCH", body: { estado }, admin: true })
      setReservas(prev => prev.map(r => (r.id === reserva.id ? { ...r, estado: actualizada.estado } : r)))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "end" }}>
        <label>Desde<br />
          <input type="date" name="desde" value={filtros.desde} onChange={cambiarFiltro} style={input} />
        </label>
        <label>Hasta<br />
          <input type="date" name="hasta" value={filtros.hasta} onChange={cambiarFiltro} style={input} />
        </label>
        <label>Estado<br />
          <select name="estado" value={filtros.estado} onChange={cambiarFiltro} style={input}>
            <option value="">Todos</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
      </div>

      {error && <div style={mensajeError}>{error}</div>}
      {cargando && <p>Cargando...</p>}
      {!cargando && reservas.length === 0 && <p>No hay reservas con estos filtros.</p>}

      {reservas.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr>
                {["Fecha", "Hora", "Paciente", "Contacto", "Servicio", "Estado"].map(t => <th key={t} style={celda}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.id}>
                  <td style={celda}>{fechaChilena(r.fecha)}</td>
                  <td style={celda}>{r.hora}</td>
                  <td style={celda}>
                    {r.nombre} {r.apellido_paterno} {r.apellido_materno}<br />
                    <small>{r.rut}</small>
                  </td>
                  <td style={celda}>
                    <a href={`tel:${r.telefono}`}>{r.telefono}</a><br />
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </td>
                  <td style={celda}>{r.servicio}</td>
                  <td style={celda}>
                    <select value={r.estado} onChange={e => cambiarEstado(r, e.target.value)}
                      style={{ ...input, color: COLORES_ESTADO[r.estado], fontWeight: "bold" }}>
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminReservas
