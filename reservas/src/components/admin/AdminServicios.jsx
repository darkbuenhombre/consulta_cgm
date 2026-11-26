import { useEffect, useState } from "react"
import { api } from "../../api"
import { botonChico, input, mensajeError } from "../../estilos"

const NUEVO = { codigo: "", nombre: "", duracion_min: 30, precio: "", activo: true }

// Fila editable de un servicio. Para un servicio nuevo, "servicio.id" no existe.
function FilaServicio({ servicio, onGuardar }) {
  const [valores, setValores] = useState({ ...servicio, precio: servicio.precio ?? "" })
  const [guardando, setGuardando] = useState(false)

  function cambiar(e) {
    const { name, value, type, checked } = e.target
    setValores(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function guardar() {
    setGuardando(true)
    await onGuardar({ ...valores, precio: valores.precio === "" ? null : valores.precio })
    setGuardando(false)
  }

  return (
    <tr>
      <td><input name="nombre" value={valores.nombre} onChange={cambiar} placeholder="Limpieza dental" style={input} /></td>
      <td><input name="codigo" value={valores.codigo} onChange={cambiar} placeholder="limpieza" style={{ ...input, width: "110px" }} /></td>
      <td><input name="duracion_min" type="number" min="5" step="5" value={valores.duracion_min} onChange={cambiar} style={{ ...input, width: "70px" }} /></td>
      <td><input name="precio" type="number" min="0" value={valores.precio} onChange={cambiar} placeholder="—" style={{ ...input, width: "90px" }} /></td>
      <td style={{ textAlign: "center" }}><input name="activo" type="checkbox" checked={valores.activo} onChange={cambiar} /></td>
      <td>
        <button onClick={guardar} disabled={guardando} style={botonChico}>
          {servicio.id ? "Guardar" : "Agregar"}
        </button>
      </td>
    </tr>
  )
}

function AdminServicios() {
  const [servicios, setServicios] = useState([])
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")

  useEffect(() => {
    api("/admin/servicios", { admin: true }).then(setServicios).catch(e => setError(e.message))
  }, [])

  async function guardar(servicio) {
    setError("")
    setAviso("")
    try {
      if (servicio.id) {
        const actualizado = await api(`/admin/servicios/${servicio.id}`, { method: "PUT", body: servicio, admin: true })
        setServicios(prev => prev.map(s => (s.id === actualizado.id ? actualizado : s)))
      } else {
        const creado = await api("/admin/servicios", { method: "POST", body: servicio, admin: true })
        setServicios(prev => [...prev, creado])
      }
      setAviso("Cambios guardados")
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <p style={{ color: "#555" }}>
        Los servicios desactivados no aparecen en el formulario de reserva. El código es un identificador
        interno (solo minúsculas, sin espacios). La duración es informativa: cada reserva ocupa un bloque del horario.
      </p>
      {error && <div style={mensajeError}>{error}</div>}
      {aviso && <p style={{ color: "#2C5F4A" }}>{aviso}</p>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: "6px" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Nombre</th><th>Código</th><th>Minutos</th><th>Precio ($)</th><th>Activo</th><th></th>
            </tr>
          </thead>
          <tbody>
            {servicios.map(s => <FilaServicio key={s.id} servicio={s} onGuardar={guardar} />)}
            <FilaServicio key={`nuevo-${servicios.length}`} servicio={NUEVO} onGuardar={guardar} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminServicios
