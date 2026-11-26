import { useEffect, useState } from "react"
import { api } from "../api"

function SelectorServicio({ onSeleccionar }) {
  const [servicio, setServicio] = useState("")
  const [servicios, setServicios] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    api("/servicios")
      .then(setServicios)
      .catch(e => setError(e.message))
  }, [])

  function manejoSeleccion(e) {
    setServicio(e.target.value)
    onSeleccionar(e.target.value)
  }

  return (
    <div>
      <h2>Tipo de consulta</h2>
      <select value={servicio} onChange={manejoSeleccion}>
        <option value="">Seleccione un servicio...</option>
        {servicios.map(s => (
          <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
        ))}
      </select>
      {error && <p style={{ color: "#a12622" }}>{error}</p>}
    </div>
  )
}

export default SelectorServicio
