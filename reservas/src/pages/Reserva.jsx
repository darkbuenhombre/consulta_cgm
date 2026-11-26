import { useState } from "react"
import { Link } from "react-router-dom"
import { api, aTextoFecha, fechaChilena } from "../api"
import DatosPaciente from "../components/DatosPaciente"
import Header from "../components/Header"
import SelectorFecha from "../components/SelectorFecha"
import SelectorHora from "../components/SelectorHora"
import SelectorServicio from "../components/SelectorServicio"
import { botonPrincipal, contenedor, mensajeError, tarjeta } from "../estilos"

const RESERVA_VACIA = { datos: {}, servicio: "", fecha: null, hora: "" }

function Reserva() {
  const [reserva, setReserva] = useState(RESERVA_VACIA)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const [confirmada, setConfirmada] = useState(null)
  const [recargaHoras, setRecargaHoras] = useState(0)
  // Cambiar "formulario" vuelve a montar los componentes para dejarlos en blanco.
  const [formulario, setFormulario] = useState(0)

  function actualizarDatos(datos) {
    setReserva(prev => ({ ...prev, datos }))
  }

  function actualizarServicio(servicio) {
    setReserva(prev => ({ ...prev, servicio }))
  }

  function actualizarFecha(fecha) {
    setReserva(prev => ({ ...prev, fecha, hora: "" }))
  }

  function actualizarHora(hora) {
    setReserva(prev => ({ ...prev, hora }))
  }

  async function enviarReserva() {
    const { datos, servicio, fecha, hora } = reserva
    setError("")

    if (!datos.nombre || !datos.apellido_paterno || !datos.apellido_materno) return setError("Ingresa tu nombre y apellidos")
    if (!datos.rut) return setError("Ingresa tu RUT")
    if (!datos.telefono) return setError("Ingresa tu teléfono")
    if (!datos.email) return setError("Ingresa tu correo")
    if (!servicio) return setError("Selecciona un servicio")
    if (!fecha) return setError("Selecciona una fecha")
    if (!hora) return setError("Selecciona un horario")

    setEnviando(true)
    try {
      const resultado = await api("/reservas", {
        method: "POST",
        body: { datos, servicio, fecha: aTextoFecha(fecha), hora }
      })
      setConfirmada({ ...resultado, email: datos.email })
    } catch (e) {
      setError(e.message)
      // Si la hora ya fue tomada, se actualizan los horarios disponibles.
      if (e.status === 409) {
        setReserva(prev => ({ ...prev, hora: "" }))
        setRecargaHoras(n => n + 1)
      }
    } finally {
      setEnviando(false)
    }
  }

  function nuevaReserva() {
    setReserva(RESERVA_VACIA)
    setConfirmada(null)
    setFormulario(n => n + 1)
  }

  if (confirmada) {
    return (
      <div style={contenedor}>
        <Header />
        <div style={tarjeta}>
          <h2 style={{ marginTop: 0 }}>¡Reserva confirmada!</h2>
          <p><strong>Servicio:</strong> {confirmada.servicio}</p>
          <p><strong>Fecha:</strong> {fechaChilena(confirmada.fecha)}</p>
          <p><strong>Hora:</strong> {confirmada.hora} hrs</p>
          <p>Te enviamos un correo a <strong>{confirmada.email}</strong> con los detalles.</p>
          <p>
            Si necesitas cancelar, usa el enlace del correo o{" "}
            <Link to={`/cancelar/${confirmada.token_cancelacion}`}>haz clic aquí</Link>.
          </p>
        </div>
        <button onClick={nuevaReserva} style={botonPrincipal}>Hacer otra reserva</button>
      </div>
    )
  }

  const fechaTexto = reserva.fecha ? aTextoFecha(reserva.fecha) : ""

  return (
    <div key={formulario} style={contenedor}>
      <Header />
      <DatosPaciente onCambio={actualizarDatos} />
      <SelectorServicio onSeleccionar={actualizarServicio} />
      <SelectorFecha onSeleccionar={actualizarFecha} />
      <SelectorHora fecha={fechaTexto} recarga={recargaHoras} onSeleccionar={actualizarHora} />

      {error && <div style={mensajeError}>{error}</div>}

      <button onClick={enviarReserva} disabled={enviando}
        style={{ ...botonPrincipal, opacity: enviando ? 0.6 : 1 }}>
        {enviando ? "Enviando..." : "Confirmar reserva"}
      </button>
    </div>
  )
}

export default Reserva
