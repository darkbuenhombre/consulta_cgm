import { useEffect, useState } from "react"
import { api, fechaChilena } from "../../api"
import { botonChico, botonSecundario, input, mensajeError } from "../../estilos"

const DIAS = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado" }

function HorarioSemanal() {
  const [tramos, setTramos] = useState([])
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")

  useEffect(() => {
    api("/admin/horario", { admin: true }).then(setTramos).catch(e => setError(e.message))
  }, [])

  function cambiar(indice, campo, valor) {
    setTramos(prev => prev.map((t, i) => (i === indice ? { ...t, [campo]: valor } : t)))
  }

  function agregar() {
    setTramos(prev => [...prev, { dia_semana: 1, hora_inicio: "09:00", hora_fin: "13:00", intervalo_min: 30 }])
  }

  function quitar(indice) {
    setTramos(prev => prev.filter((_, i) => i !== indice))
  }

  async function guardar() {
    setError("")
    setAviso("")
    try {
      setTramos(await api("/admin/horario", { method: "PUT", body: tramos, admin: true }))
      setAviso("Horario guardado")
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <h3>Horario de atención</h3>
      <p style={{ color: "#555" }}>
        Cada tramo se divide en bloques. Por ejemplo, de 09:00 a 12:30 cada 30 minutos genera
        bloques desde las 09:00 hasta las 12:00. Las reservas ya hechas no se modifican.
      </p>
      {error && <div style={mensajeError}>{error}</div>}
      {aviso && <p style={{ color: "#2C5F4A" }}>{aviso}</p>}
      <table style={{ borderCollapse: "separate", borderSpacing: "6px" }}>
        <thead>
          <tr style={{ textAlign: "left" }}><th>Día</th><th>Desde</th><th>Hasta</th><th>Bloques (min)</th><th></th></tr>
        </thead>
        <tbody>
          {tramos.map((t, i) => (
            <tr key={i}>
              <td>
                <select value={t.dia_semana} onChange={e => cambiar(i, "dia_semana", Number(e.target.value))} style={input}>
                  {Object.entries(DIAS).map(([n, nombre]) => <option key={n} value={n}>{nombre}</option>)}
                </select>
              </td>
              <td><input type="time" value={t.hora_inicio} onChange={e => cambiar(i, "hora_inicio", e.target.value)} style={input} /></td>
              <td><input type="time" value={t.hora_fin} onChange={e => cambiar(i, "hora_fin", e.target.value)} style={input} /></td>
              <td><input type="number" min="5" step="5" value={t.intervalo_min} onChange={e => cambiar(i, "intervalo_min", e.target.value)} style={{ ...input, width: "70px" }} /></td>
              <td><button onClick={() => quitar(i)} style={botonSecundario}>Quitar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button onClick={agregar} style={botonSecundario}>Agregar tramo</button>
        <button onClick={guardar} style={botonChico}>Guardar horario</button>
      </div>
    </section>
  )
}

function DiasBloqueados() {
  const [dias, setDias] = useState([])
  const [nuevo, setNuevo] = useState({ fecha: "", motivo: "" })
  const [error, setError] = useState("")

  useEffect(() => {
    api("/admin/dias-bloqueados", { admin: true }).then(setDias).catch(e => setError(e.message))
  }, [])

  async function agregar(e) {
    e.preventDefault()
    setError("")
    try {
      const dia = await api("/admin/dias-bloqueados", { method: "POST", body: nuevo, admin: true })
      setDias(prev => [...prev.filter(d => d.fecha !== dia.fecha), dia].sort((a, b) => a.fecha.localeCompare(b.fecha)))
      setNuevo({ fecha: "", motivo: "" })
    } catch (e) {
      setError(e.message)
    }
  }

  async function quitar(fecha) {
    setError("")
    try {
      await api(`/admin/dias-bloqueados/${fecha}`, { method: "DELETE", admin: true })
      setDias(prev => prev.filter(d => d.fecha !== fecha))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section style={{ marginTop: "32px" }}>
      <h3>Días sin atención</h3>
      <p style={{ color: "#555" }}>Feriados, vacaciones u otros días en que no se puede reservar.</p>
      {error && <div style={mensajeError}>{error}</div>}
      <form onSubmit={agregar} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input type="date" required value={nuevo.fecha} onChange={e => setNuevo({ ...nuevo, fecha: e.target.value })} style={input} />
        <input placeholder="Motivo (opcional)" value={nuevo.motivo} onChange={e => setNuevo({ ...nuevo, motivo: e.target.value })} style={input} />
        <button type="submit" style={botonChico}>Bloquear día</button>
      </form>
      <ul>
        {dias.map(d => (
          <li key={d.fecha} style={{ margin: "6px 0" }}>
            {fechaChilena(d.fecha)} {d.motivo && `— ${d.motivo}`}{" "}
            <button onClick={() => quitar(d.fecha)} style={botonSecundario}>Quitar</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AdminHorario() {
  return (
    <div>
      <HorarioSemanal />
      <DiasBloqueados />
    </div>
  )
}

export default AdminHorario
