import { useEffect, useState } from "react"
import { api } from "../api"

// "fecha" es un texto "YYYY-MM-DD". "recarga" es un número que, al cambiar,
// vuelve a pedir la disponibilidad (por ejemplo, si alguien tomó la hora antes).
function SelectorHora({ fecha, recarga, onSeleccionar }) {
  const [horarios, setHorarios] = useState([])
  const [horaSeleccionada, setHoraSeleccionada] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setHoraSeleccionada("")
    setHorarios([])
    setError("")
    if (!fecha) return

    let vigente = true
    setCargando(true)
    api(`/disponibilidad?fecha=${fecha}`)
      .then(datos => vigente && setHorarios(datos.horarios))
      .catch(e => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false))

    // Si la fecha cambia antes de que llegue la respuesta, se ignora la respuesta antigua.
    return () => { vigente = false }
  }, [fecha, recarga])

  function seleccionar(hora) {
    setHoraSeleccionada(hora)
    onSeleccionar(hora)
  }

  return (
    <div>
      <h2>Seleccionar horario</h2>
      {!fecha && <p>Primero selecciona una fecha.</p>}
      {cargando && <p>Cargando horarios...</p>}
      {error && <p role="alert" style={{ color: "var(--error)" }}>{error}</p>}
      {fecha && !cargando && !error && horarios.length === 0 && (
        <p>No hay atención este día. Por favor elige otra fecha.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 'var(--esp-2)' }}>
        {horarios.map(({ hora, disponible }) => {
          const ocupado = !disponible
          const seleccionado = hora === horaSeleccionada
          return (
            <button key={hora} onClick={() => seleccionar(hora)} disabled={ocupado} aria-pressed={seleccionado}
              style={{
                padding: '10px', minHeight: '44px', borderRadius: 'var(--radio-sm)', fontWeight: 500,
                border: `1px solid ${seleccionado ? 'var(--accion)' : ocupado ? 'var(--borde)' : 'var(--borde-control)'}`,
                cursor: ocupado ? 'not-allowed' : 'pointer',
                backgroundColor: seleccionado ? 'var(--accion)' : ocupado ? 'var(--fondo-suave)' : 'var(--accion-suave)',
                color: seleccionado ? 'var(--texto-sobre-azul)' : ocupado ? 'var(--texto-suave)' : 'var(--texto)',
                textDecoration: ocupado ? 'line-through' : 'none'
              }}>
              {hora}
            </button>
          )
        })}
      </div>
      {horaSeleccionada && <p style={{ marginTop: 'var(--esp-3)', color: 'var(--texto-suave)' }}>Hora: {horaSeleccionada} hrs</p>}
    </div>
  )
}

export default SelectorHora
