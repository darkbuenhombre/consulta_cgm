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
      {error && <p style={{ color: "#a12622" }}>{error}</p>}
      {fecha && !cargando && !error && horarios.length === 0 && (
        <p>No hay atención este día. Por favor elige otra fecha.</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {horarios.map(({ hora, disponible }) => {
          const ocupado = !disponible
          const seleccionado = hora === horaSeleccionada
          return (
            <button key={hora} onClick={() => seleccionar(hora)} disabled={ocupado}
              style={{
                padding: '10px', borderRadius: '8px', border: '1px solid #ccc',
                cursor: ocupado ? 'not-allowed' : 'pointer',
                backgroundColor: seleccionado ? '#2C5F4A' : ocupado ? '#e0e0e0' : '#f5f5f5',
                color: seleccionado ? 'white' : ocupado ? '#aaa' : 'black',
                textDecoration: ocupado ? 'line-through' : 'none'
              }}>
              {hora}
            </button>
          )
        })}
      </div>
      {horaSeleccionada && <p>Hora: {horaSeleccionada} hrs</p>}
    </div>
  )
}

export default SelectorHora
