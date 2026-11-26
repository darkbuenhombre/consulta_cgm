import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { api, fechaChilena } from "../api"
import Header from "../components/Header"
import { botonPrincipal, contenedor, mensajeError, tarjeta } from "../estilos"

const ESTADOS = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada"
}

function Cancelar() {
  const { token } = useParams()
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState("")
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    api(`/reservas/cancelar/${token}`)
      .then(setReserva)
      .catch(e => setError(e.message))
  }, [token])

  async function cancelar() {
    if (!window.confirm("¿Seguro que quieres cancelar tu hora?")) return
    setCancelando(true)
    setError("")
    try {
      setReserva(await api(`/reservas/cancelar/${token}`, { method: "POST" }))
    } catch (e) {
      setError(e.message)
    } finally {
      setCancelando(false)
    }
  }

  return (
    <div style={contenedor}>
      <Header />
      <h2>Cancelar reserva</h2>

      {!reserva && !error && <p>Cargando...</p>}

      {reserva && (
        <div style={tarjeta}>
          <p>Hola {reserva.nombre}, esta es tu reserva:</p>
          <p><strong>Servicio:</strong> {reserva.servicio}</p>
          <p><strong>Fecha:</strong> {fechaChilena(reserva.fecha)}</p>
          <p><strong>Hora:</strong> {reserva.hora} hrs</p>
          <p><strong>Estado:</strong> {ESTADOS[reserva.estado]}</p>
          {reserva.estado === "cancelada" && <p>Tu hora fue cancelada. Te enviamos un correo de confirmación.</p>}
          {reserva.estado !== "cancelada" && !reserva.cancelable && <p>Esta reserva ya no se puede cancelar.</p>}
        </div>
      )}

      {error && <div style={mensajeError}>{error}</div>}

      {reserva?.cancelable && (
        <button onClick={cancelar} disabled={cancelando}
          style={{ ...botonPrincipal, backgroundColor: "#a12622", opacity: cancelando ? 0.6 : 1 }}>
          {cancelando ? "Cancelando..." : "Cancelar mi hora"}
        </button>
      )}

      <p style={{ marginTop: "24px" }}><Link to="/">Volver a reservar una hora</Link></p>
    </div>
  )
}

export default Cancelar
