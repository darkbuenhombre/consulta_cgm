import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { cerrarSesion, obtenerToken } from "../api"
import AdminHorario from "../components/admin/AdminHorario"
import AdminReservas from "../components/admin/AdminReservas"
import AdminServicios from "../components/admin/AdminServicios"
import Header from "../components/Header"
import { botonSecundario, contenedor, VERDE } from "../estilos"

const PESTANAS = {
  reservas: { titulo: "Reservas", Componente: AdminReservas },
  servicios: { titulo: "Servicios", Componente: AdminServicios },
  horario: { titulo: "Horario", Componente: AdminHorario }
}

function AdminPanel() {
  const navigate = useNavigate()
  const [pestana, setPestana] = useState("reservas")

  if (!obtenerToken()) return <Navigate to="/admin/login" replace />

  function salir() {
    cerrarSesion()
    navigate("/admin/login", { replace: true })
  }

  const { Componente } = PESTANAS[pestana]

  return (
    <div style={{ ...contenedor, maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Header />
        <button onClick={salir} style={botonSecundario}>Cerrar sesión</button>
      </div>

      <nav style={{ display: "flex", gap: "8px", borderBottom: `2px solid ${VERDE}`, marginBottom: "16px" }}>
        {Object.entries(PESTANAS).map(([clave, { titulo }]) => (
          <button key={clave} onClick={() => setPestana(clave)}
            style={{
              padding: "10px 16px", border: "none", borderRadius: "8px 8px 0 0", cursor: "pointer",
              backgroundColor: pestana === clave ? VERDE : "transparent",
              color: pestana === clave ? "white" : VERDE, fontSize: "15px"
            }}>
            {titulo}
          </button>
        ))}
        <Link to="/admin/inventario"
          style={{ padding: "10px 16px", color: VERDE, fontSize: "15px", textDecoration: "none", alignSelf: "center" }}>
          Inventario
        </Link>
      </nav>

      <Componente />
    </div>
  )
}

export default AdminPanel
